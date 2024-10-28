const CANVAS = document.getElementById("map-canvas") as HTMLCanvasElement;

const LOCATION_ICON = new Image();
LOCATION_ICON.src = "assets/location-icon.png";

class Rectangle {
  constructor(
    public x0: number,
    public x1: number,
    public y0: number,
    public y1: number
  ) {}

  public intersects(rect: Rectangle): boolean {
    // return this.contains(rect) || (
    //   // ((this.x0 < rect.x0 && this.x1 > rect.x0) || (this.x0 < rect.x1 && this.x1 > rect.x1) || (this.x0 > rect.x0 && this.x1 < rect.x1)) &&
    //   // ((this.y0 < rect.y0 && this.y1 > rect.y0) || (this.y0 < rect.y1 && this.y1 > rect.y1) || (this.y0 > rect.y0 && this.y1 < rect.y1))
    //   (rect.x0 < this.x0 && rect.x1 > this.x0 || rect.x1 > this.x1 && rect.x0 < this.x1) &&
    //   (rect.y0 < this.y0 && rect.y1 > this.y0 || rect.y1 > this.y1 && rect.y0 < this.y1)
    // );
    if (this.x1 <= rect.x0 || this.x0 >= rect.x1) return false;
    if (this.y1 <= rect.y0 || this.y0 >= rect.y1) return false;

    return true;
  }

  public contains(rect: Rectangle): boolean {
    return (
      rect.x0 >= this.x0 && rect.x1 <= this.x1 &&
      rect.y0 >= this.y0 && rect.y1 <= this.y1
    );
  }
}

class QuadTree extends Rectangle {
  public SW: QuadTree | null = null;
  public NW: QuadTree | null = null;
  public SE: QuadTree | null = null;
  public NE: QuadTree | null = null;

  constructor(x0: number, x1: number, y0: number, y1: number, public number: number = 0) {
    super(x0, x1, y0, y1);
  }
}

function subdivideQuads(quad: QuadTree, count: number) {
  if (count <= 0) return;

  const midX = floor((quad.x0 + quad.x1)/2);
  const midY = floor((quad.y0 + quad.y1)/2);

  quad.SW = new QuadTree(quad.x0, midX, quad.y0, midY, quad.number*4 + 1);
  quad.SE = new QuadTree(midX + 1, quad.x1, quad.y0, midY, quad.number*4 + 2);
  quad.NW = new QuadTree(quad.x0, midX, midY + 1, quad.y1, quad.number*4 + 3);
  quad.NE = new QuadTree(midX + 1, quad.x1, midY + 1, quad.y1, quad.number*4 + 4);

  subdivideQuads(quad.SW, count - 1);
  subdivideQuads(quad.SE, count - 1);
  subdivideQuads(quad.NW, count - 1);
  subdivideQuads(quad.NE, count - 1);
}

function getContainedQuads(target: Rectangle, quad: QuadTree, quads: QuadTree[]) {
  const intersects = target.intersects(quad);
  
  if (!intersects) return;

  const contains = target.contains(quad);
  
  if (contains) {
    quads.push(quad);

    return;
  }

  if (quad.SW && quad.SE && quad.NW && quad.NE) {
    getContainedQuads(target, quad.SW, quads);
    getContainedQuads(target, quad.SE, quads);
    getContainedQuads(target, quad.NW, quads);
    getContainedQuads(target, quad.NE, quads);

  } else {
    quads.push(quad);
  }
}

class DisplayMap {
  static QUAD_TREE_SUBDIVISIONS = 6;
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

  public chunkColumns: number;
  public chunkRows: number;
  public chunkCount: number;
  public loadedChunks: Uint32Array[];

  public quadRoot: QuadTree;

  public quadTreeSize: number;
  public quadTree: Rectangle[];
  public quadTreeRestaurants: Uint32Array[];

  constructor(public app: App) {
    this.minX = app.data.x[app.sorted.x[0]];
    this.minY = app.data.y[app.sorted.y[0]];
    this.maxX = app.data.x[app.sorted.x[App.restaurantCount - 1]];
    this.maxY = app.data.y[app.sorted.y[App.restaurantCount - 1]];
    this.cameraX = (this.minX + this.maxX)/2;
    this.cameraY = (this.minY + this.maxY)/2;

    this.quadTreeSize = (4**(DisplayMap.QUAD_TREE_SUBDIVISIONS + 1) - 1)/(4 - 1)
    this.quadTree = new Array(this.quadTreeSize);
    this.quadTreeRestaurants = new Array(4**DisplayMap.QUAD_TREE_SUBDIVISIONS);

    let t1 = performance.now();
    this.quadRoot = new QuadTree(this.minX, this.maxX, this.minY, this.maxY);
    subdivideQuads(this.quadRoot, DisplayMap.QUAD_TREE_SUBDIVISIONS);
    let t2 = performance.now();

    this.quadTree[0] = new Rectangle(this.minX, this.maxX, this.minY, this.maxY);
    this.subdivideQuads();
    let t3 = performance.now();

    console.log(t2 - t1, t3 - t2);
    
    this.preloadChunks();
    this.updateDisplay();
    this.initInput();
  }

  public subdivideQuads(index: number = 0, count: number = DisplayMap.QUAD_TREE_SUBDIVISIONS) {
    if (index >= this.quadTreeSize) return;

    const quad = this.quadTree[index];
    const midX = floor((quad.x0 + quad.x1)/2);
    const midY = floor((quad.y0 + quad.y1)/2);

    const bottomLeft = 4*index + 1;
    const bottomRight = 4*index + 2;
    const topLeft = 4*index + 3;
    const topRight = 4*index + 4;

    this.quadTree[bottomLeft] = new Rectangle(quad.x0, midX, quad.y0, midY);
    this.quadTree[bottomRight] = new Rectangle(midX + 1, quad.x1, quad.y0, midY);
    this.quadTree[topLeft] = new Rectangle(quad.x0, midX, midY + 1, quad.y1);
    this.quadTree[topRight] = new Rectangle(midX + 1, quad.x1, midY + 1, quad.y1);

    this.subdivideQuads(bottomLeft, count - 1);
    this.subdivideQuads(bottomRight, count - 1);
    this.subdivideQuads(topLeft, count - 1);
    this.subdivideQuads(topRight, count - 1);
  }

  public preloadChunks() {
    const xRange = this.maxX - this.minX;
    const yRange = this.maxY - this.minY;

    this.chunkColumns = Math.ceil(xRange / DisplayMap.CHUNK_SIZE);
    this.chunkRows = Math.ceil(yRange / DisplayMap.CHUNK_SIZE);
    this.chunkCount = this.chunkRows * this.chunkColumns;

    this.loadedChunks = new Array(this.chunkCount);

    // for (let x = 0; x < this.chunkColumns; x++) {
    //   for (let y = 0; y < this.chunkRows; y++) {
    //     const chunkCount = x * this.chunkRows + y;

    //     const cY = chunkCount % this.chunkRows;
    //     const cX = (chunkCount - cY) / this.chunkRows;

    //     const chunkMinX = this.minX + cX * DisplayMap.CHUNK_SIZE;
    //     const chunkMinY = this.minY + cY * DisplayMap.CHUNK_SIZE;
    //     const chunkMaxX = chunkMinX + DisplayMap.CHUNK_SIZE - 1; // -1 so as to not include restaurants shared by the next chunk
    //     const chunkMaxY = chunkMinY + DisplayMap.CHUNK_SIZE - 1;

    //     const xInRange = filterNumbers(this.app.data.x, this.app.sorted.x, chunkMinX, chunkMaxX);
    //     const yInRange = filterNumbers(this.app.data.y, this.app.sorted.y, chunkMinY, chunkMaxY);
    //     const inRange = getIntersections([xInRange, yInRange], App.restaurantCount);

    //     this.chunks[chunkCount] = inRange;
    //   }
    // }
  }

  displayChunk(chunkNumber: number, context: CanvasRenderingContext2D, width: number, height: number, skipCount: number) {
    const cY = chunkNumber % this.chunkRows;
    const cX = (chunkNumber - cY) / this.chunkRows;
    const chunkX = this.minX + cX * DisplayMap.CHUNK_SIZE + DisplayMap.CHUNK_SIZE / 2 - this.cameraX;
    const chunkY = this.minY + cY * DisplayMap.CHUNK_SIZE + DisplayMap.CHUNK_SIZE / 2 - this.cameraY;

    const screenX = width/2 + chunkX/this.range*height/2;
    const screenY = height/2 - chunkY/this.range*height/2;
    const size = height/(this.range*2)*DisplayMap.CHUNK_SIZE;

    context.fillStyle = "red";
    context.strokeRect(screenX - size / 2, screenY - size / 2, size, size);

    context.fillStyle = "black";

    let chunkStores = this.loadedChunks[chunkNumber];

    if (!chunkStores) {
      const chunkMinX = this.minX + cX * DisplayMap.CHUNK_SIZE;
      const chunkMinY = this.minY + cY * DisplayMap.CHUNK_SIZE;
      const chunkMaxX = chunkMinX + DisplayMap.CHUNK_SIZE - 1; // -1 so as to not include restaurants shared by the next chunk
      const chunkMaxY = chunkMinY + DisplayMap.CHUNK_SIZE - 1;

      const xInRange = filterNumbers(this.app.data.x, this.app.sorted.x, chunkMinX, chunkMaxX);
      const yInRange = filterNumbers(this.app.data.y, this.app.sorted.y, chunkMinY, chunkMaxY);

      chunkStores = getIntersections([xInRange, yInRange], App.restaurantCount);

      this.loadedChunks[chunkNumber] = chunkStores;
    }

    for (let i = 0; i < chunkStores.length; i += skipCount) {
      const index = chunkStores[i];
      const xPos = this.app.data.x[index] - this.cameraX;
      const yPos = this.app.data.y[index] - this.cameraY;

      const screenX = width/2 + xPos/this.range*height/2;
      const screenY = height/2 - yPos/this.range*height/2;

      const size = height/this.range*0.5;

      // context.drawImage(LOCATION_ICON, screenX - 12, screenY - 24, 24, 24);

      context.fillRect(screenX - size / 2, screenY - size / 2, size, size);
    }
  }

  public drawRect(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, width: number, height: number) {
    let endX = x + w;
    let endY = y + h;

    x = Math.max(0, x);
    y = Math.max(0, y);
    endX = Math.min(endX, width);
    endY = Math.min(endY, height);

    context.fillRect(x, y, endX - x, endY - y);
  }

  public updateDisplay() {
    const width = CANVAS.width;
    const height = CANVAS.height;
    const aspectRatio = width/height;
    const context = CANVAS.getContext("2d") as CanvasRenderingContext2D;

    context.clearRect(0, 0, width, height);

    context.fillStyle = "red";
    context.fillRect(width/2 - height/this.range*0.5/2, height/2 - height/this.range*0.5/2, height/this.range*0.5, height/this.range*0.5);

    context.fillStyle = "black";

    const screenRect = new Rectangle(this.cameraX - this.range*aspectRatio*0.75, this.cameraX + this.range*aspectRatio*0.75, this.cameraY - this.range*0.75, this.cameraY + this.range*0.75);

    const quadsToDisplay: QuadTree[] = [];//[this.quadRoot.SW!.SW!.SW!.SW!.SW!.SW!, this.quadRoot.SW!.SW!.SW!.SW!.SW!.SE!];
    getContainedQuads(screenRect, this.quadRoot, quadsToDisplay);

    const scaleRatio = height/(this.range*2);

    for (let i = 0; i < quadsToDisplay.length; i++) {
      const quad = quadsToDisplay[i];

      if (quad.NE == null) context.fillStyle = "blue";
      else context.fillStyle = "green"

      const screenX = (quad.x0 - this.cameraX)*scaleRatio;
      const screenY = (quad.y1 - this.cameraY)*scaleRatio;
      const sizeX = (quad.x1 - quad.x0)*scaleRatio;
      const sizeY = (quad.y1 - quad.y0)*scaleRatio;

      context.fillRect(width/2 + screenX, height/2 - screenY, sizeX, sizeY);
    }

    context.strokeStyle = "red";
    context.strokeRect(width/2 + (screenRect.x0 - this.cameraX)*(height/2)/this.range, height/2 - (screenRect.y1 - this.cameraY)*(height/2)/this.range, (screenRect.x1 - screenRect.x0)*(height/2)/this.range, (screenRect.y1 - screenRect.y0)*(height/2)/this.range);
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