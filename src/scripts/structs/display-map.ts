const MAP_CONTAINER = document.getElementById("map-container") as HTMLDivElement;
const MAP_CANVAS = document.getElementById("map-canvas") as HTMLCanvasElement;

const LOCATION_ICON = new Image();
LOCATION_ICON.src = "assets/location-icon.png";

class DisplayMap {
  static CHUNK_SIZE = 100;
  static ICON_SIZE = 24;

  public cameraX: number = 0;
  public cameraY: number = 0;
  public range: number = 50;

  public lastLoadX: number;
  public lastLoadY: number;
  public lastLoadRange: number

  public minX: number = 0;
  public minY: number = 0;
  public maxX: number = 0;
  public maxY: number = 0;

  public chunkColumns: number;
  public chunkRows: number;
  public chunkCount: number;
  public loadingChunks: boolean[];
  public loadedChunks: Uint32Array[];

  public infoIndex: number | null = null;
  public infoDisplay: HTMLDivElement | null = null;
  public testX0: number | null = null;
  public testX1: number | null = null;
  public testY0: number | null = null;
  public testY1: number | null = null;
  public testX: number | null = null;
  public testY: number | null = null;

  constructor(public app: App) {
    this.minX = app.data.x[app.sorted.x[0]];
    this.minY = app.data.y[app.sorted.y[0]];
    this.maxX = app.data.x[app.sorted.x[App.restaurantCount - 1]];
    this.maxY = app.data.y[app.sorted.y[App.restaurantCount - 1]];
    this.cameraX = (this.minX + this.maxX) / 2;
    this.cameraY = (this.minY + this.maxY) / 2;

    const xRange = this.maxX - this.minX;
    const yRange = this.maxY - this.minY;

    this.chunkColumns = Math.ceil(xRange/DisplayMap.CHUNK_SIZE);
    this.chunkRows = Math.ceil(yRange/DisplayMap.CHUNK_SIZE);
    this.chunkCount = this.chunkRows * this.chunkColumns;
    this.loadingChunks = new Array(this.chunkCount);
    this.loadedChunks = new Array(this.chunkCount);

    this.updateDisplay();
    this.initInput();

    // load chunks in parallel (so that it does not yield) and slowly preload chunks outwards overtime (also maybe sort based on distance from cam)
  }

  public loadChunk(chunkMinX: number, chunkMinY: number, chunkMaxX: number, chunkMaxY: number, chunkNumber: number) {
    const inRange = getIntersections([
      filterNumbers(this.app.data.x, this.app.sorted.x, chunkMinX, chunkMaxX),
      filterNumbers(this.app.data.y, this.app.sorted.y, chunkMinY, chunkMaxY)
    ], App.restaurantCount);

    this.loadedChunks[chunkNumber] = inRange;

    // const promise = new Promise<Uint32Array>((resolve) => {
    //   // console.log(chunkNumber);
    //   const xInRange = filterNumbers(this.app.data.x, this.app.sorted.x, chunkMinX, chunkMaxX);
    //   const yInRange = filterNumbers(this.app.data.y, this.app.sorted.y, chunkMinY, chunkMaxY);
    //   const inRange = getIntersections([xInRange, yInRange], App.restaurantCount);

    //   resolve(inRange);
    // });

    // promise.then((restaurants: Uint32Array) => {
    //   this.loadedChunks[chunkNumber] = restaurants;
    // });
  }

  public updateDisplay() {
    const width = MAP_CANVAS.width;
    const height = MAP_CANVAS.height;
    const aspectRatio = width/height;
    const context = MAP_CANVAS.getContext("2d") as CanvasRenderingContext2D;

    context.clearRect(0, 0, width, height);
    context.fillStyle = "black";

    const scaleRatio = height / (this.range * 2);

    const minX = this.cameraX - this.range * aspectRatio;
    const maxX = this.cameraX + this.range * aspectRatio;
    const minY = this.cameraY - this.range;
    const maxY = this.cameraY + this.range;

    let minChunkX = floor(minX / DisplayMap.CHUNK_SIZE);
    let minChunkY = floor(minY / DisplayMap.CHUNK_SIZE);
    let maxChunkX = floor(maxX / DisplayMap.CHUNK_SIZE);
    let maxChunkY = floor(maxY / DisplayMap.CHUNK_SIZE);

    minChunkX = clamp(minChunkX, 0, this.chunkColumns - 1);
    maxChunkX = clamp(maxChunkX, 0, this.chunkColumns - 1);
    minChunkY = clamp(minChunkY, 0, this.chunkRows - 1);
    maxChunkY = clamp(maxChunkY, 0, this.chunkRows - 1);

    // const chunkSkip = 2 ** floor(this.range / 500);
    const restaurantSkip = 2**floor(this.range/25);

    for (let x = minChunkX; x <= maxChunkX; x++) {
      for (let y = minChunkY; y <= maxChunkY; y++) {
        const chunkNumber = x*this.chunkColumns + y;

        let restaurants = this.loadedChunks[chunkNumber];

        const chunkMinX = x * DisplayMap.CHUNK_SIZE;
        const chunkMinY = y * DisplayMap.CHUNK_SIZE;
        const chunkSize = DisplayMap.CHUNK_SIZE;

        const screenX = width / 2 + (chunkMinX - this.cameraX) * scaleRatio;
        const screenY = height / 2 - (chunkMinY + chunkSize - this.cameraY) * scaleRatio;
        const screenSize = chunkSize*scaleRatio;

        context.strokeRect(screenX, screenY, screenSize, screenSize);

        if (this.testX0 && this.testX1 && this.testY0 && this.testY1 && this.testX && this.testY) {
          const posX = (this.testX0 - this.cameraX)*scaleRatio;
          const posY = (this.testY1 - this.cameraY)*scaleRatio;
          const sizeX = (this.testX1 - this.testX0)*scaleRatio;
          const sizeY = (this.testY1 - this.testY0)*scaleRatio;
          const posX2 = (this.testX - this.cameraX)*scaleRatio;
          const posY2 = (this.testY - this.cameraY)*scaleRatio;

          context.strokeStyle = "red";
          context.fillStyle = "red";
          context.strokeRect(width/2 + posX, height/2 - posY, sizeX, sizeY);
          context.fillRect(width/2 + posX2, height/2 - posY2, 10, 10);
          context.strokeStyle = "black";
          context.fillStyle = "black";
        }

        if (restaurants) {
          for (let i = 0; i < restaurants.length; i++) {
            const index = restaurants[i];

            const xPos = this.app.data.x[index] - this.cameraX;
            const yPos = this.app.data.y[index] - this.cameraY;

            const screenX = width/2 + xPos*scaleRatio;
            const screenY = height/2 - yPos*scaleRatio;

            if (index == this.infoIndex) {
              context.fillRect(screenX, screenY, 20, 20);
            }

            if (index % restaurantSkip != 0) continue;

            context.drawImage(LOCATION_ICON, screenX - DisplayMap.ICON_SIZE/2, screenY - DisplayMap.ICON_SIZE, DisplayMap.ICON_SIZE, DisplayMap.ICON_SIZE);
            context.fillText(this.app.data.storeName[index], screenX, screenY);
          }

        } else if (this.loadingChunks[chunkNumber] != true) {
          this.loadingChunks[chunkNumber] = true;

          this.loadChunk(chunkMinX, chunkMinY, chunkMinX + chunkSize - 1, chunkMinY + chunkSize - 1, chunkNumber);
        }
      }
    }

    // const filteredX = filterNumbers(this.app.data.x, this.app.sorted.x, minX, maxX);
    // const filteredY = filterNumbers(this.app.data.y, this.app.sorted.y, minY, maxY);
    // const combined = getIntersections([filteredX, filteredY], App.restaurantCount);
    // const combLength = combined.length;

    // for (let i = 0; i < combLength; i++) {
    //   const index = combined[i];
    //   const restX = this.app.data.x[index];
    //   const restY = this.app.data.y[index];

    //   const screenX = (restX - this.cameraX)*scaleRatio;
    //   const screenY = (restY - this.cameraY)*scaleRatio;

    //   context.fillRect(width/2 + screenX - 5, height/2 - screenY - 5, 10, 10);
    // }

    // const screenRect = new Rectangle(this.cameraX - this.range*aspectRatio*0.75, this.cameraX + this.range*aspectRatio*0.75, this.cameraY - this.range*0.75, this.cameraY + this.range*0.75);

    // const quadsToDisplay: QuadTree[] = [];//[this.quadRoot.SW!.SW!.SW!.SW!.SW!.SW!, this.quadRoot.SW!.SW!.SW!.SW!.SW!.SE!];
    // getContainedQuads(screenRect, this.quadRoot, quadsToDisplay);

    // for (let i = 0; i < quadsToDisplay.length; i++) {
    //   const quad = quadsToDisplay[i];

    //   if (quad.NE == null) context.fillStyle = "blue";
    //   else context.fillStyle = "green"

    //   const screenX = (quad.x0 - this.cameraX)*scaleRatio;
    //   const screenY = (quad.y1 - this.cameraY)*scaleRatio;
    //   const sizeX = (quad.x1 - quad.x0)*scaleRatio;
    //   const sizeY = (quad.y1 - quad.y0)*scaleRatio;

    //   context.fillRect(width/2 + screenX, height/2 - screenY, sizeX, sizeY);
    // }

    // context.strokeStyle = "red";
    // context.strokeRect(width/2 + (screenRect.x0 - this.cameraX)*(height/2)/this.range, height/2 - (screenRect.y1 - this.cameraY)*(height/2)/this.range, (screenRect.x1 - screenRect.x0)*(height/2)/this.range, (screenRect.y1 - screenRect.y0)*(height/2)/this.range);
  }

  moveCamera(x: number, y: number) {
    this.cameraX += x;
    this.cameraY += y;

    this.updateDisplay();
  }

  zoomCamera(direction: boolean) {
    if (direction) this.range *= 1.1;
    else this.range /= 1.1;

    this.updateDisplay();
  }

  initInput() {
    let mouseX: number | null;
    let mouseY: number | null;

    MAP_CANVAS.addEventListener("contextmenu", (event: MouseEvent) => {
      event.preventDefault();
    });

    MAP_CANVAS.addEventListener("mousedown", (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      const bounds = MAP_CANVAS.getBoundingClientRect();
      const width = MAP_CANVAS.width;
      const height = MAP_CANVAS.height;
      const scaleRatio = height/(this.range*2);

      const screenX = event.clientX - bounds.left;
      const screenY = event.clientY - bounds.top;
      const actualX = this.cameraX + (screenX - width/2)/scaleRatio;
      const actualY = this.cameraY + (height/2 - screenY)/scaleRatio;
      const actualSize = DisplayMap.ICON_SIZE/scaleRatio*1.1;

      console.log(height/2, mouseY);

      // height/2 = 225
      // 225 - 0 = 225
      // 225*range*2/450
      // 0.5*range*2
      // range

      this.testX0 = actualX - actualSize/2;
      this.testX1 = actualX + actualSize/2;
      this.testY0 = actualY - actualSize/2;
      this.testY1 = actualY + actualSize/2;
      this.testX = actualX;
      this.testY = actualY;
      this.updateDisplay();

      const inRange = getIntersections([
        filterNumbers(this.app.data.x, this.app.sorted.x, actualX - actualSize/2, actualX + actualSize/2),
        filterNumbers(this.app.data.y, this.app.sorted.y, actualY - actualSize/2, actualY + actualSize/2)
      ], App.restaurantCount);

      const restIndex = inRange[0];

      if (restIndex) {
        if (this.infoIndex && this.infoDisplay) {
          this.infoIndex = null;
          this.infoDisplay.remove();
        }

        const screenX = (this.app.data.x[restIndex] - this.cameraX)*scaleRatio;
        const screenY = (this.app.data.y[restIndex] - this.cameraY)*scaleRatio;

        const infoDiv = document.createElement("div");
        infoDiv.className = "map-info";
        infoDiv.style.left = String(screenX - bounds.left) + "px";
        infoDiv.style.top = String(screenY - bounds.top) + "px";

        const name = document.createElement("p");
        name.innerText = this.app.data.storeName[restIndex];

        console.log(name.innerText, this.app.data.x[restIndex], this.app.data.y[restIndex], actualX, actualY);

        infoDiv.appendChild(name);
        MAP_CONTAINER.appendChild(infoDiv);

        this.infoIndex = restIndex;
        this.infoDisplay = infoDiv;

        this.updateDisplay();
      }
    });

    document.addEventListener("mousemove", (event: MouseEvent) => {
      if (mouseX && mouseY) {
        const diffX = event.clientX - mouseX;
        const diffY = event.clientY - mouseY;

        mouseX = event.clientX;
        mouseY = event.clientY;

        const scaleRatio = MAP_CANVAS.height/(this.range*2);

        this.moveCamera(-diffX/scaleRatio, diffY/scaleRatio);
      }
    });

    document.addEventListener("mouseup", (event: MouseEvent) => {
      mouseX = null;
      mouseY = null;
    });

    MAP_CANVAS.addEventListener("wheel", (event: WheelEvent) => {
      this.zoomCamera(event.deltaY > 0);
    });
  }
}