const CANVAS = document.getElementById("map-canvas") as HTMLCanvasElement;

interface Chunk {
  x: number;
  y: number;
  restaurants: Uint32Array;
}

class DisplayMap {
  static CHUNK_SIZE = 100;

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

  public chunks: Uint32Array[];
  public chunkColumns: number;
  public chunkRows: number;
  public chunkCount: number;

  public activeChunks: number[];

  constructor(public app: App) {
    this.minX = app.data.x[app.sorted.x[0]];
    this.minY = app.data.y[app.sorted.y[0]];
    this.maxX = app.data.x[app.sorted.x[App.restaurantCount - 1]];
    this.maxY = app.data.y[app.sorted.y[App.restaurantCount - 1]];
    // this.cameraX = (this.minX + this.maxX)/2;
    // this.cameraY = (this.minY + this.maxY)/2;

    console.log(this.minX, this.minY, this.maxX, this.maxY);

    this.preloadChunks();
    this.updateDisplay();
    this.initInput();
  }

  //   public createChunk(x: number, y: number) {
  //     const chunkX = x*DisplayMap.CHUNK_SIZE;
  //     const chunkY = y*DisplayMap.CHUNK_SIZE;
  //     const chunkHalf = DisplayMap.CHUNK_SIZE/2;
  //     const xInRange = filterNumbers(this.app.data.x, this.app.sorted.x, chunkX - chunkHalf, chunkX + chunkHalf);
  //     const yInRange = filterNumbers(this.app.data.y, this.app.sorted.y, chunkY - chunkHalf, chunkY + chunkHalf);
  //     const inRange = getIntersections([xInRange, yInRange], App.restaurantCount);
  //     const chunkHash = String(x) + String(y);

  //     this.currentChunks[chunkX][chunkY] = {
  //       x: chunkX,
  //       y: chunkY,
  //       restaurants: inRange
  //     }
  //   }

  public preloadChunks() {
    const xRange = this.maxX - this.minX;
    const yRange = this.maxY - this.minY;

    this.chunkColumns = Math.ceil(xRange / DisplayMap.CHUNK_SIZE);
    this.chunkRows = Math.ceil(yRange / DisplayMap.CHUNK_SIZE);
    this.chunkCount = this.chunkRows * this.chunkColumns;

    this.chunks = new Array(this.chunkCount);

    for (let x = 0; x < this.chunkColumns; x++) {
      for (let y = 0; y < this.chunkRows; y++) {
        const chunkCount = x * this.chunkRows + y;

        const cY = chunkCount % this.chunkRows;
        const cX = (chunkCount - cY) / this.chunkRows;

        const chunkMinX = this.minX + cX * DisplayMap.CHUNK_SIZE;
        const chunkMinY = this.minY + cY * DisplayMap.CHUNK_SIZE;
        const chunkMaxX = chunkMinX + DisplayMap.CHUNK_SIZE - 1; // -1 so as to not include restaurants shared by the next chunk
        const chunkMaxY = chunkMinY + DisplayMap.CHUNK_SIZE - 1;

        const xInRange = filterNumbers(this.app.data.x, this.app.sorted.x, chunkMinX, chunkMaxX);
        const yInRange = filterNumbers(this.app.data.y, this.app.sorted.y, chunkMinY, chunkMaxY);
        const inRange = getIntersections([xInRange, yInRange], App.restaurantCount);

        this.chunks[chunkCount] = inRange;
      }
    }
  }

  //   public loadChunks() {
  //     const currentChunkX = round(this.cameraX/DisplayMap.CHUNK_SIZE);
  //     const currentChunkY = round(this.cameraY/DisplayMap.CHUNK_SIZE);
  //     const chunksRange = Math.ceil(this.range/DisplayMap.CHUNK_SIZE);
  //     console.log(chunksRange);

  //     // for (let i in this.currentChunks) {
  //     //   const chunk = this.currentChunks[i];

  //     //   if (Math.abs(currentChunkX - chunk.x) > chunksRange || Math.abs(currentChunkY - chunk.y) > chunksRange) {
  //     //     delete this.currentChunks[i];
  //     //   }
  //     // }

  //     for (let x = -chunksRange; x <= chunksRange; x++) {
  //       if (!this.currentChunks[x]) this.currentChunks[x] = {};

  //       for (let y = -chunksRange; y <= chunksRange; y++) {
  //         const xPos = currentChunkX + x;
  //         const yPos = currentChunkY + y;
  //         const chunkHash = String(xPos) + String(yPos);
  //         console.log(xPos, yPos);

  //         if (!this.currentChunks[x][y]) this.createChunk(xPos, yPos);
  //       }
  //     }

  //     console.log(this.currentChunks);
  //   }

  //   loadTargets() {
  //     const loadRange = this.range * 3;

  //     const minX = this.cameraX - loadRange;
  //     const maxX = this.cameraX + loadRange;
  //     const minY = this.cameraY - loadRange;
  //     const maxY = this.cameraY + loadRange;

  //     const xInRange = filterNumbers(this.app.data.x, this.app.sorted.x, minX, maxX);
  //     const yInRange = filterNumbers(this.app.data.y, this.app.sorted.y, minY, maxY);

  //     this.loadedX = this.cameraX;
  //     this.loadedY = this.cameraY;
  //     this.loadedRange = loadRange;
  //     this.loaded = getIntersections([xInRange, yInRange], App.restaurantCount);
  //   }

  // checkForLoad() {
  //   if (Math.abs(this.cameraX - this.loadedX) + this.range > this.loadedRange || Math.abs(this.cameraY - this.loadedY) > this.loadedRange || this.range < this.loadedRange / 3) {
  //     console.log("TEST");
  //     this.loadTargets();
  //   }
  // }

  displayChunk(chunkNumber: number, context: CanvasRenderingContext2D, width: number, height: number) {
    const chunkRestaurants = this.chunks[chunkNumber];

    const cY = chunkNumber % this.chunkRows;
    const cX = (chunkNumber - cY) / this.chunkRows;
    const chunkX = this.minX + cX * DisplayMap.CHUNK_SIZE + DisplayMap.CHUNK_SIZE / 2 - this.cameraX;
    const chunkY = this.minY + cY * DisplayMap.CHUNK_SIZE + DisplayMap.CHUNK_SIZE / 2 - this.cameraY;

    const screenX = width/2 + chunkX/this.range*height/2;
    const screenY = height/2 - chunkY/this.range*height/2;
    const size = height/(this.range*2)*DisplayMap.CHUNK_SIZE;

    context.fillStyle = `rgb(${(chunkNumber / 3 % 1) * 255 / 2 + 255 / 2}, ${(chunkNumber / 5 % 1) * 255 / 2 + 255 / 2}, ${(chunkNumber / 4 % 1) * 255 / 2 + 255 / 2})`
    context.fillRect(screenX - size / 2, screenY - size / 2, size, size);

    context.fillStyle = "black";

    for (let i = 0; i < chunkRestaurants.length; i++) {
      const index = chunkRestaurants[i];
      const xPos = this.app.data.x[index] - this.cameraX;
      const yPos = this.app.data.y[index] - this.cameraY;

      const screenX = width/2 + xPos/this.range*height/2;
      const screenY = height/2 - yPos/this.range*height/2;

      const size = height/this.range*0.5;

      context.fillRect(screenX - size / 2, screenY - size / 2, size, size);
    }
  }

  updateDisplay() {
    const width = CANVAS.width;
    const height = CANVAS.height;
    const aspectRatio = width/height;
    const context = CANVAS.getContext("2d") as CanvasRenderingContext2D;

    context.clearRect(0, 0, width, height);

    context.fillStyle = "red";
    context.fillRect(width/2 - height/this.range*0.5/2, height/2 - height/this.range*0.5, height/this.range*0.5, height/this.range*0.5);

    context.fillStyle = "black";

    const camChunkX = floor((this.cameraX - this.minX) / DisplayMap.CHUNK_SIZE);
    const camChunkY = floor((this.cameraY - this.minY) / DisplayMap.CHUNK_SIZE);

    for (let x = 0; x <= 0; x++) {
      for (let y = 0; y <= 0; y++) {
        const xPos = camChunkX + x;
        const yPos = camChunkY + y;
        const chunkNumber = xPos * this.chunkRows + yPos;

        if (chunkNumber >= 0 && chunkNumber < this.chunkCount) this.displayChunk(chunkNumber, context, width, height);
      }
    }

    const chunkRangeX = Math.ceil(this.range*aspectRatio/DisplayMap.CHUNK_SIZE);
    const chunkRangeY = Math.ceil(this.range*aspectRatio/DisplayMap.CHUNK_SIZE);
    const xOffset = this.cameraX - camChunkX*DisplayMap.CHUNK_SIZE;
    
    console.log(xOffset);

    console.log(chunkRangeX, chunkRangeY);

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

    context.lineWidth = width / this.range * 0.01;

    for (let x = -rangeFloor; x <= rangeFloor; x++) {
      if (x == 0 || x == -rangeFloor || x == rangeFloor) context.strokeStyle = "red";
      else context.strokeStyle = "black";

      const xPos = x - this.cameraX % 1;
      const screenPos = width / 2 + xPos / this.range * width / 2;

      context.beginPath();
      context.moveTo(screenPos, 0);
      context.lineTo(screenPos, height);
      context.stroke();
    }

    for (let y = 0; y < this.range * 2; y++) {
      const yPos = y - this.cameraY % 1;
      const screenPos = height / 2 - yPos / this.range * height / 2;

      context.beginPath();
      context.moveTo(0, screenPos);
      context.lineTo(width, screenPos);
      context.stroke();
    }
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

    CANVAS.addEventListener("contextmenu", (event: MouseEvent) => {
      event.preventDefault();
    });

    CANVAS.addEventListener("mousedown", (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    document.addEventListener("mousemove", (event: MouseEvent) => {
      if (mouseX && mouseY) {
        const diffX = event.clientX - mouseX;
        const diffY = event.clientY - mouseY;

        mouseX = event.clientX;
        mouseY = event.clientY;

        this.moveCamera(-diffX/CANVAS.width*this.range*2, diffY/CANVAS.height*this.range*2);
      }
    });

    document.addEventListener("mouseup", (event: MouseEvent) => {
      mouseX = null;
      mouseY = null;
    });

    CANVAS.addEventListener("wheel", (event: WheelEvent) => {
      this.zoomCamera(event.deltaY > 0);
    });
  }
}

new DisplayMap(app)