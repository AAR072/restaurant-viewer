const CANVAS = document.getElementById("map-canvas") as HTMLCanvasElement;

interface Chunk {
  x: number;
  y: number;
  restaurants: Uint32Array;
}

class DisplayMap {
  static CHUNK_SIZE = 50;

  public cameraX: number = 0;
  public cameraY: number = 0;
  public range: number = 50;

  public loadedX: number;
  public loadedY: number;
  public loadedRange: number
  public loaded: Uint32Array;

  public minX: number = 0;
  public minY: number = 0;
  public maxX: number = 0;
  public maxY: number = 0;

  public chunks: Uint32Array[];
  public currentChunks: {[key: number]: {
    [key: number]: Chunk
  }} = {};

  constructor(public app: App) {
    this.minX = app.data.x[app.sorted.x[0]];
    this.minY = app.data.y[app.sorted.y[0]];
    this.maxX = app.data.x[app.sorted.x[App.restaurantCount - 1]];
    this.maxY = app.data.y[app.sorted.y[App.restaurantCount - 1]];
    this.cameraX = (this.minX + this.maxX)/2;
    this.cameraY = (this.minY + this.maxY)/2;

    console.log(this.minX, this.minY, this.maxX, this.maxY);

    // this.loadChunks();
    // this.paint();
    // this.initInput();
    this.testLoadChunks();
  }

  public createChunk(x: number, y: number) {
    const chunkX = x*DisplayMap.CHUNK_SIZE;
    const chunkY = y*DisplayMap.CHUNK_SIZE;
    const chunkHalf = DisplayMap.CHUNK_SIZE/2;
    const xInRange = filterNumbers(this.app.data.x, this.app.sorted.x, chunkX - chunkHalf, chunkX + chunkHalf);
    const yInRange = filterNumbers(this.app.data.y, this.app.sorted.y, chunkY - chunkHalf, chunkY + chunkHalf);
    const inRange = getIntersections([xInRange, yInRange], App.restaurantCount);
    const chunkHash = String(x) + String(y);

    this.currentChunks[chunkX][chunkY] = {
      x: chunkX,
      y: chunkY,
      restaurants: inRange
    }
  }

  public testLoadChunks() {
    const xRange = this.maxX - this.minX;
    const yRange = this.maxY - this.minY;
    const chunkColumns = Math.ceil(xRange/DisplayMap.CHUNK_SIZE);
    const chunkRows = Math.ceil(yRange/DisplayMap.CHUNK_SIZE);
    const startChunkX = this.minX;
    const startChunkY = this.minY;

    for (let x = 0; x < chunkColumns; x++) {
      for (let y = 0; y < chunkRows; y++) {
        const chunkCount = x*chunkRows + y;

        const cY = chunkCount % chunkRows;
        const cX = (chunkCount - cY)/chunkRows;

        const chunkMinX = startChunkX + cX;
        const chunkMinY = startChunkY + cY;
        const chunkMaxX = chunkMinX + DisplayMap.CHUNK_SIZE;
        const chunkMaxY = chunkMinY + DisplayMap.CHUNK_SIZE;

        const xInRange = filterNumbers
      }
    }
  }

  public loadChunks() {
    const currentChunkX = round(this.cameraX/DisplayMap.CHUNK_SIZE);
    const currentChunkY = round(this.cameraY/DisplayMap.CHUNK_SIZE);
    const chunksRange = Math.ceil(this.range/DisplayMap.CHUNK_SIZE);
    console.log(chunksRange);

    // for (let i in this.currentChunks) {
    //   const chunk = this.currentChunks[i];

    //   if (Math.abs(currentChunkX - chunk.x) > chunksRange || Math.abs(currentChunkY - chunk.y) > chunksRange) {
    //     delete this.currentChunks[i];
    //   }
    // }

    for (let x = -chunksRange; x <= chunksRange; x++) {
      if (!this.currentChunks[x]) this.currentChunks[x] = {};

      for (let y = -chunksRange; y <= chunksRange; y++) {
        const xPos = currentChunkX + x;
        const yPos = currentChunkY + y;
        const chunkHash = String(xPos) + String(yPos);
        console.log(xPos, yPos);

        if (!this.currentChunks[x][y]) this.createChunk(xPos, yPos);
      }
    }

    console.log(this.currentChunks);
  }

  loadTargets() {
    const loadRange = this.range * 3;

    const minX = this.cameraX - loadRange;
    const maxX = this.cameraX + loadRange;
    const minY = this.cameraY - loadRange;
    const maxY = this.cameraY + loadRange;

    const xInRange = filterNumbers(this.app.data.x, this.app.sorted.x, minX, maxX);
    const yInRange = filterNumbers(this.app.data.y, this.app.sorted.y, minY, maxY);

    this.loadedX = this.cameraX;
    this.loadedY = this.cameraY;
    this.loadedRange = loadRange;
    this.loaded = getIntersections([xInRange, yInRange], App.restaurantCount);
  }

  // checkForLoad() {
  //   if (Math.abs(this.cameraX - this.loadedX) + this.range > this.loadedRange || Math.abs(this.cameraY - this.loadedY) > this.loadedRange || this.range < this.loadedRange / 3) {
  //     console.log("TEST");
  //     this.loadTargets();
  //   }
  // }

  paint() {
    const width = CANVAS.width;
    const height = CANVAS.height;
    const aspectRatio = width / height;
    const context = CANVAS.getContext("2d") as CanvasRenderingContext2D;

    context.clearRect(0, 0, width, height);

    context.fillStyle = "red";
    context.fillRect(width / 2 - width / this.range * 0.5 / 2, height / 2 - width / this.range * 0.5, width / this.range * 0.5, width / this.range * 0.5);

    context.fillStyle = "black";

    // for (let i = 0; i < this.loaded.length; i++) {
    //   const index = this.loaded[i];
    //   const xPos = this.app.data.x[index] - this.cameraX;
    //   const yPos = this.app.data.y[index] - this.cameraY;

    //   const screenX = width / 2 + xPos / this.range * width / 2;
    //   const screenY = height / 2 - yPos / this.range * height / 2;

    //   const size = width / this.range * 0.5;

    //   context.fillRect(screenX - size / 2, screenY - size / 2, size, size);
    // }

    // for (let i in this.currentChunks) {
    //   const chunk = this.currentChunks[i];
    //   const chunkX = chunk.x*DisplayMap.CHUNK_SIZE;
    //   const chunkY = chunk.y*DisplayMap.CHUNK_SIZE;
    //   const halfChunk = DisplayMap.CHUNK_SIZE/2;

    //   const screenX = width/2 + chunkX/this.range*width/2;
    //   const screenY = height/2 - chunkY/this.range*height/2;
    //   const size = width/(this.range*2)*halfChunk;

    //   context.fillStyle = `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`
    //   context.fillRect(screenX - size, screenY - size, size, size);
    // }

    const thickness = width / this.range * 0.2;
    const rangeFloor = Math.floor(this.range);
    const rangeCeil = Math.ceil(this.range);

    // for (let x = -rangeFloor; x <= rangeFloor; x++) {
    //     if (x == 0 || x == -rangeFloor || x == rangeFloor) context.strokeStyle = "red";
    //     else context.strokeStyle = "black";

    //     const xPos = x + 0.5 - this.cameraX % 1;
    //     const screenPos = width/2 + xPos/this.range*width/2;

    //     context.beginPath();
    //     context.moveTo(screenPos, 0);
    //     context.lineTo(screenPos, height);
    //     context.stroke();
    // }

    // for (let y = 0; y < this.range*2; y++) {
    //     const yPos = y + 0.5 - this.cameraY % 1;
    //     const screenPos = height/2 - yPos/this.range*height/2;

    //     context.beginPath();
    //     context.moveTo(0, screenPos);
    //     context.lineTo(width, screenPos);
    //     context.stroke();
    // }
  }

  moveCamera(x: number, y: number) {
    this.cameraX += x;
    this.cameraY += y;

    // this.loadChunks();
    this.paint();
  }

  zoomCamera(direction: boolean) {
    if (direction) this.range *= 1.1;
    else this.range /= 1.1;

    // this.loadChunks();
    this.paint();
  }

  initInput() {
    let mouseX: number | null;
    let mouseY: number | null;

    CANVAS.addEventListener("contextmenu", (event: MouseEvent) => {
      event.preventDefault();
    });

    CANVAS.addEventListener("mousedown", (event: MouseEvent) => {
      if (event.button == 2) {
        mouseX = event.clientX;
        mouseY = event.clientY;
      }
    });

    CANVAS.addEventListener("mousemove", (event: MouseEvent) => {
      if (mouseX && mouseY) {
        const diffX = event.clientX - mouseX;
        const diffY = event.clientY - mouseY;

        mouseX = event.clientX;
        mouseY = event.clientY;

        this.moveCamera(-diffX * 2 * this.range / CANVAS.width, diffY * 2 * this.range / CANVAS.height);
      }
    });

    CANVAS.addEventListener("mouseup", (event: MouseEvent) => {
      if (event.button == 2) {
        mouseX = null;
        mouseY = null;
      }
    });

    CANVAS.addEventListener("wheel", (event: WheelEvent) => {
      this.zoomCamera(event.deltaY > 0);
    });
  }
}

new DisplayMap(app)