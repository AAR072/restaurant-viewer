const MAP_CONTAINER = document.getElementById("map-container") as HTMLDivElement;
const MAP_CANVAS = document.getElementById("map-canvas") as HTMLCanvasElement;

const LOCATION_ICON = new Image();
LOCATION_ICON.src = "assets/location-icon.png";

class DisplayMap {
  static CHUNK_SIZE = 100;
  static ICON_SIZE = 24;
  static TEXT_SIZE = 12;
  static ZOOM_FACTOR = 1.1;

  public cameraX: number = 0;
  public cameraY: number = 0;
  public range: number = 10;

  public context: CanvasRenderingContext2D;
  public width: number;
  public height: number;
  public bounds: DOMRect;

  public minX: number;
  public minY: number;
  public maxX: number;
  public maxY: number;

  public chunkColumns: number;
  public chunkRows: number;
  public chunkCount: number;
  public loadingChunks: boolean[];
  public loadedChunks: Uint32Array[];

  public infoIndex: number | null = null;
  public infoDisplay: HTMLDivElement | null = null;

  constructor(public app: App) {
    this.context = MAP_CANVAS.getContext("2d")!;
    this.width = MAP_CANVAS.width;
    this.height = MAP_CANVAS.height;
    this.bounds = MAP_CANVAS.getBoundingClientRect();

    this.context.font = `${DisplayMap.TEXT_SIZE}px Ubuntu`;

    // listen to canvas resize for width, height and bounds

    this.minX = app.data.x[app.sorted.x[0]];
    this.minY = app.data.y[app.sorted.y[0]];
    this.maxX = app.data.x[app.sorted.x[App.restaurantCount - 1]];
    this.maxY = app.data.y[app.sorted.y[App.restaurantCount - 1]];
    this.cameraX = (this.minX + this.maxX)/2;
    this.cameraY = (this.minY + this.maxY)/2;

    const xRange = this.maxX - this.minX;
    const yRange = this.maxY - this.minY;

    this.chunkColumns = ceil(xRange/DisplayMap.CHUNK_SIZE);
    this.chunkRows = ceil(yRange/DisplayMap.CHUNK_SIZE);
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
    const aspectRatio = this.width/this.height;
    const scaleRatio = this.height/(this.range*2);

    this.context.clearRect(0, 0, this.width, this.height);

    this.context.fillStyle = "black";
    this.context.strokeStyle = "black";

    // fix this, ceil sometimes not working
    const gridScale = 2**floor(Math.log2(this.range/10));
    const gridXMin = ceil(this.cameraX - this.range*aspectRatio, gridScale);
    const gridXMax = floor(this.cameraX + this.range*aspectRatio, gridScale);
    const gridYMin = ceil(this.cameraX - this.range, gridScale);
    const gridYMax = floor(this.cameraY + this.range, gridScale);

    for (let x = gridXMin; x <= gridXMax; x += gridScale) {
      const screenX = this.width/2 + (x - this.cameraX)*scaleRatio;

      this.context.beginPath();
      this.context.moveTo(screenX, 0);
      this.context.lineTo(screenX, this.height);
      this.context.stroke();
    }

    for (let y = gridYMin; y <= gridYMax; y += gridScale) {
      const screenY = this.height/2 - (y - this.cameraY)*scaleRatio;

      this.context.beginPath();
      this.context.moveTo(0, screenY);
      this.context.lineTo(this.width, screenY);
      this.context.stroke();
    }

    const minX = this.cameraX - this.range*aspectRatio;
    const maxX = this.cameraX + this.range*aspectRatio;
    const minY = this.cameraY - this.range;
    const maxY = this.cameraY + this.range;

    let minChunkX = floor(minX/DisplayMap.CHUNK_SIZE);
    let minChunkY = floor(minY/DisplayMap.CHUNK_SIZE);
    let maxChunkX = floor(maxX/DisplayMap.CHUNK_SIZE);
    let maxChunkY = floor(maxY/DisplayMap.CHUNK_SIZE);

    minChunkX = clamp(minChunkX, 0, this.chunkColumns - 1);
    maxChunkX = clamp(maxChunkX, 0, this.chunkColumns - 1);
    minChunkY = clamp(minChunkY, 0, this.chunkRows - 1);
    maxChunkY = clamp(maxChunkY, 0, this.chunkRows - 1);

    // const chunkSkip = 2 ** floor(this.range / 500);
    const restaurantSkip = 2**floor(this.range/25);

    this.context.strokeStyle = "red";

    for (let x = minChunkX; x <= maxChunkX; x++) {
      for (let y = minChunkY; y <= maxChunkY; y++) {
        const chunkNumber = x*this.chunkColumns + y;

        let restaurants = this.loadedChunks[chunkNumber];

        const chunkMinX = x * DisplayMap.CHUNK_SIZE;
        const chunkMinY = y * DisplayMap.CHUNK_SIZE;
        const chunkSize = DisplayMap.CHUNK_SIZE;

        const screenX = this.width/2 + (chunkMinX - this.cameraX)*scaleRatio;
        const screenY = this.height/2 - (chunkMinY + chunkSize - this.cameraY)*scaleRatio;
        const screenSize = chunkSize*scaleRatio;

        this.context.strokeRect(screenX, screenY, screenSize, screenSize);

        if (restaurants) {
          for (let i = 0; i < restaurants.length; i++) {
            const index = restaurants[i];

            if (index % restaurantSkip != 0) continue;

            const xPos = this.app.data.x[index] - this.cameraX;
            const yPos = this.app.data.y[index] - this.cameraY;

            const screenX = this.width/2 + xPos*scaleRatio;
            const screenY = this.height/2 - yPos*scaleRatio;

            this.context.drawImage(LOCATION_ICON, screenX - DisplayMap.ICON_SIZE/2, screenY - DisplayMap.ICON_SIZE, DisplayMap.ICON_SIZE, DisplayMap.ICON_SIZE);
            this.context.fillText(this.app.data.storeName[index], screenX + DisplayMap.ICON_SIZE/2, screenY - DisplayMap.ICON_SIZE/2);
          }

        } else if (this.loadingChunks[chunkNumber] != true) {
          this.loadingChunks[chunkNumber] = true;

          this.loadChunk(chunkMinX, chunkMinY, chunkMinX + chunkSize - 1, chunkMinY + chunkSize - 1, chunkNumber);
        }
      }
    }
  }

  public moveCamera(x: number, y: number) {
    this.cameraX += x;
    this.cameraY += y;

    this.updateDisplay();
  }

  public zoomCamera(direction: boolean) {
    if (direction) this.range *= DisplayMap.ZOOM_FACTOR;
    else this.range /= DisplayMap.ZOOM_FACTOR;

    this.updateDisplay();
  }

  public createInfo(index: number, left: number, top: number) {
    const div = document.createElement("div");
    div.className = "map-info";
    div.style.left = left + "px";
    div.style.top = top + "px";

    const id = document.createElement("p");
    id.innerText = "ID: " + this.app.data.ID[index];

    const name = document.createElement("p");
    name.innerText = "Name: " + this.app.data.storeName[index];

    const type = document.createElement("p");
    type.innerText = "Type: " + this.app.data.type[index];

    const cost = document.createElement("p");
    cost.innerText = "Cost: $" + this.app.data.cost[index].toFixed(2);

    const review = document.createElement("p");
    review.innerText = "Review: " + this.app.data.review[index].toFixed(1);

    const position = document.createElement("p");
    position.innerText = `Position: (x: ${this.app.data.x[index]*App.gridScale}m, y: ${this.app.data.y[index]*App.gridScale}m)`

    div.appendChild(id);
    div.appendChild(name);
    div.appendChild(type);
    div.appendChild(cost);
    div.appendChild(review);
    div.appendChild(position);

    MAP_CONTAINER.appendChild(div);

    this.infoDisplay = div;
  }

  public initInput() {
    let mouseX: number | null;
    let mouseY: number | null;

    MAP_CANVAS.addEventListener("contextmenu", (event: MouseEvent) => {
      event.preventDefault();
    });

    MAP_CANVAS.addEventListener("mousedown", (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (this.infoIndex && this.infoDisplay) {
        this.infoIndex = null;
        this.infoDisplay.remove();
      }

      const scaleRatio = this.height/(this.range*2);

      const screenX = event.clientX - this.bounds.left;
      const screenY = event.clientY - this.bounds.top;
      const actualX = this.cameraX + (screenX - this.width/2)/scaleRatio;
      const actualY = this.cameraY + (this.height/2 - screenY)/scaleRatio;
      const actualSize = DisplayMap.ICON_SIZE/scaleRatio*1.1;

      const inRange = getIntersections([
        filterNumbers(this.app.data.x, this.app.sorted.x, actualX - actualSize/2, actualX + actualSize/2),
        filterNumbers(this.app.data.y, this.app.sorted.y, actualY - actualSize, actualY)
      ], App.restaurantCount);

      if (inRange.length > 0) {
        const index = inRange[0];

        const screenX = this.width/2 + (this.app.data.x[index] - this.cameraX)*scaleRatio;
        const screenY = this.height/2 - (this.app.data.y[index] - this.cameraY)*scaleRatio;

        this.createInfo(index, screenX - this.bounds.left, screenY - this.bounds.top);
        this.infoIndex = index;

        this.updateDisplay();
      }
    });

    document.addEventListener("mousemove", (event: MouseEvent) => {
      if (mouseX && mouseY) {
        const diffX = event.clientX - mouseX;
        const diffY = event.clientY - mouseY;

        mouseX = event.clientX;
        mouseY = event.clientY;

        const scaleRatio = this.height/(this.range*2);

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