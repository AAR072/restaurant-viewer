const MAP_CONTAINER = document.getElementById("map-container") as HTMLDivElement;
const MAP_CANVAS = document.getElementById("map-canvas") as HTMLCanvasElement;
const MAP_GRID_SCALE = document.getElementById("map-grid-scale") as HTMLSpanElement;

const MAP_INFO = document.getElementById("map-info") as HTMLDivElement;
const MAP_INFO_POS = document.getElementById("map-info-pos") as HTMLParagraphElement;
const MAP_SET_LOCATION = document.getElementById("map-set-location") as HTMLButtonElement;
const MAP_SET_DEST = document.getElementById("map-set-dest") as HTMLButtonElement;

const LOCATION_ICON = new Image();
LOCATION_ICON.src = "assets/location-icon.png";
LOCATION_ICON.alt = "Refresh the page to load icons";

function constantRandom(seed: number, index: number): number {
  const hash = (seed ^ (index*0x5bd1e995) ^ (seed << 16)) >>> 0;

  return (hash & 3);
}

function randomQuadSplit(count: number, seed: number): Uint32Array {
  const portions = new Uint32Array(4);
  const portion = floor(count/4);
  let remainder = count % 4;

  for (let i = 0; i < 4; i++) {
    portions[i] = portion + (remainder > 0 ? 1 : 0);
    remainder--;
  }

  for (let i = 0; i < 4; i++) {
    const newIndex = (i + constantRandom(seed, i)) % 4;
    const temp = portions[i];

    portions[i] = portions[newIndex];
    portions[newIndex] = temp;
  }

  return portions;
}

class Rectangle {
  public w: number;
  public h: number;

  constructor(
    public x0: number,
    public x1: number,
    public y0: number,
    public y1: number
  ) {
    this.w = this.x1 - this.x0;
    this.h = this.y1 - this.y0;
  }

  public intersects(rect: Rectangle): boolean {
    if (this.x1 <= rect.x0 || this.x0 >= rect.x1) return false;
    if (this.y1 <= rect.y0 || this.y0 >= rect.y1) return false;

    return true;
  }
}

class MapAnimation {
  public active: boolean = true;
  public progress: number = 0;
  public lastTime: number;

  constructor(
    private callback: (value: number) => any,
    private duration: number = 2
  ) {
    requestAnimationFrame((timeStamp: number) => {
      this.lastTime = timeStamp;

      this.animationStep(timeStamp);
    });
  }

  private getTimeProgress(): number {
    if (this.progress > 0.5) return 1/2*((this.progress - 1)*2)**3 + 1;
      else return 1/2*(this.progress*2)**3;
  }

  private animationStep(time: number) {
    if (!this.active) return;

    const deltaTime = (time - this.lastTime)/1000;

    this.lastTime = time;
    this.progress += deltaTime/this.duration;

    if (this.progress >= 1) {
      this.progress = 1;
      this.active = false;
    }

    this.callback(this.getTimeProgress());

    requestAnimationFrame((timestamp: number) => {
      this.animationStep(timestamp);
    });
  }

  public cancel() {
    this.active = false;
  }
}

class DisplayMap {
  static ZOOM_SPEED = 0.001;
  static MIN_ZOOM = 1;
  static MAX_ZOOM = 10;

  static GRID_RANGE_FACTOR = 16;
  static QT_SUBDIVISIONS = 6;

  public cameraX: number = 0;
  public cameraY: number = 0;

  public zoom: number = 5;
  public range: number;
  public scaleRatio: number;
  public aspectRatio: number;

  public context: CanvasRenderingContext2D;
  public width: number;
  public height: number;
  public bounds: DOMRect;

  public mapRect: Rectangle;

  public quadTree: Rectangle[];
  public qtSize: number;
  public qtLeaves: number;
  public qtRestaurants: number[][];
  public qtLeafSizeX: number;
  public qtLeafSizeY: number;

  public visibleRests: number[];
  public infoDisplay: HTMLDivElement | null = null;
  public positionInfoX: number | null = null;
  public positionInfoY: number | null = null;

  public animation: MapAnimation | null = null;

  public currentPath: TNode[] | null = null;
  public currentPathDist: number | null = null;

  constructor(public app: App) {
    this.context = MAP_CANVAS.getContext("2d")!;

    this.mapRect = new Rectangle(
      app.data.x[app.sorted.x[0]],
      app.data.x[app.sorted.x[App.RESTAURANT_COUNT - 1]] + 1,
      app.data.y[app.sorted.y[0]],
      app.data.y[app.sorted.y[App.RESTAURANT_COUNT - 1]] + 1
    );

    this.cameraX = this.app.locationX;
    this.cameraY = this.app.locationY;

    this.loadQuadTree();

    this.setDimensions(MAP_CANVAS.getBoundingClientRect());
    this.setRangeScale();

    this.initInput();
    this.render();
  }

  // find index of leaf containing point using morton/z-curve index method
  private getQuadLeaf(x: number, y: number): number {
    const gridX = floor(x/this.qtLeafSizeX);
    const gridY = floor(y/this.qtLeafSizeY);

    let index = 0;

    for (let i = 0; i < DisplayMap.QT_SUBDIVISIONS; i++) {
      const xBit = (gridX >> i) & 1;
      const yBit = (gridY >> i) & 1;

      index |= (xBit << (2*i)) | (yBit << (2*i + 1));
    }

    return index;
  }

  private loadQuadTree() {
    this.qtSize = geoSeries(4, DisplayMap.QT_SUBDIVISIONS + 1);
    this.qtLeaves = 4**DisplayMap.QT_SUBDIVISIONS;
    this.quadTree = new Array(this.qtSize);
    this.qtRestaurants = new Array(this.qtLeaves);
    this.qtLeafSizeX = this.mapRect.w/(1 << DisplayMap.QT_SUBDIVISIONS);
    this.qtLeafSizeY = this.mapRect.h/(1 << DisplayMap.QT_SUBDIVISIONS);

    this.subdivideQuads(this.mapRect);

    const restaurantPointers = new Uint32Array(this.qtLeaves);

    for (let i = 0; i < App.RESTAURANT_COUNT; i++) {
      const index = this.getQuadLeaf(this.app.data.x[i], this.app.data.y[i]);

      if (!this.qtRestaurants[index]) this.qtRestaurants[index] = [];

      this.qtRestaurants[index][restaurantPointers[index]++] = i;
    }
  }

  private subdivideQuads(quad: Rectangle, index: number = 0, count: number = DisplayMap.QT_SUBDIVISIONS) {
    if (count < 0) return;

    const midX = (quad.x0 + quad.x1)/2;
    const midY = (quad.y0 + quad.y1)/2;

    this.quadTree[index] = quad;

    const bottomLeft = new Rectangle(quad.x0, midX, quad.y0, midY);
    const bottomRight = new Rectangle(midX, quad.x1, quad.y0, midY);
    const topLeft = new Rectangle(quad.x0, midX, midY, quad.y1);
    const topRight = new Rectangle(midX, quad.x1, midY, quad.y1);

    index *= 4;
    count--;

    this.subdivideQuads(bottomLeft, index + 1, count);
    this.subdivideQuads(bottomRight, index + 2, count);
    this.subdivideQuads(topLeft, index + 3, count);
    this.subdivideQuads(topRight, index + 4, count);
  }

  private getQuadsInside(target: Rectangle, desiredDepth: number, quadList: number[], index: number = 0, depth: number = 0) {
    const quad = this.quadTree[index];

    if (!target.intersects(quad)) return;

    if (depth == desiredDepth) {
      quadList[quadList.length] = index;

      return;
    }

    index *= 4;
    depth++;

    this.getQuadsInside(target, desiredDepth, quadList, index + 1, depth);
    this.getQuadsInside(target, desiredDepth, quadList, index + 2, depth);
    this.getQuadsInside(target, desiredDepth, quadList, index + 3, depth);
    this.getQuadsInside(target, desiredDepth, quadList, index + 4, depth);
  }

  private getRestaurantsInQuad(index: number, depth: number, restCount: number, restList: number[]) {
    if (restCount <= 0) return;

    if (depth == DisplayMap.QT_SUBDIVISIONS) {
      const quadRestaurants = this.qtRestaurants[index - this.qtSize + this.qtLeaves];
      const restLen = quadRestaurants.length;

      for (let i = 0; i < restCount; i++) {
        if (i >= restLen) break;

        restList[restList.length] = quadRestaurants[i];
      }

      return;
    }

    const parts = randomQuadSplit(restCount, index);

    index *= 4;
    depth++;

    this.getRestaurantsInQuad(index + 1, depth, parts[0], restList);
    this.getRestaurantsInQuad(index + 2, depth, parts[1], restList);
    this.getRestaurantsInQuad(index + 3, depth, parts[2], restList);
    this.getRestaurantsInQuad(index + 4, depth, parts[3], restList);
  }

  private setDimensions(rect: DOMRectReadOnly) {
    const width = rect.width;
    const height = rect.height;

    MAP_CANVAS.width = width;
    MAP_CANVAS.height = height;

    this.width = width;
    this.height = height;
    this.bounds = rect;
    this.aspectRatio = width/height;
  }

  private setRangeScale() {
    this.range = 2**this.zoom;
    this.scaleRatio = this.height/(this.range*2);
  }

  public panCamera(x: number, y: number) {
    this.clearAnimation();

    this.cameraX += x;
    this.cameraY += y;

    this.render();
  }

  public changeZoom(delta: number) {
    this.clearAnimation();

    this.zoom = clamp(this.zoom + delta*DisplayMap.ZOOM_SPEED, DisplayMap.MIN_ZOOM, DisplayMap.MAX_ZOOM);

    this.setRangeScale();
    this.render();
  }

  public animateCamera(goalX: number, goalY: number, goalZoom: number = DisplayMap.MIN_ZOOM) {
    this.clearAnimation();

    const initialX = this.cameraX;
    const initialY = this.cameraY;
    const initialZoom = this.zoom;

    this.animation = new MapAnimation((t: number) => {
      this.cameraX = lerp(initialX, goalX, t);
      this.cameraY = lerp(initialY, goalY, t);
      this.zoom = lerp(initialZoom, goalZoom, t);
      this.setRangeScale();
      this.render();
    });
  }

  public clearAnimation() {
    if (this.animation) {
      this.animation.cancel();
      this.animation = null;
    }
  }

  public viewRestaurant(index: number) {
    const x = this.app.data.x[index];
    const y = this.app.data.y[index];

    this.animateCamera(x, y);
  }

  public setPath(path: TNode[], dist: number) {
    const last = path[path.length - 1];

    this.currentPath = path;
    this.currentPathDist = dist;
    this.animateCamera(last.x, last.y);
  }

  public clearPath() {
    this.currentPath = null;
    this.currentPathDist = null;
    this.render();
  }

  private drawLine(x0: number, y0: number, x1: number, y1: number, style: string, width: number) {
    this.context.beginPath();
    this.context.moveTo(x0, y0);
    this.context.lineTo(x1, y1);

    this.context.strokeStyle = style;
    this.context.lineWidth = width;
    this.context.stroke();
  }

  public drawCircle(x: number, y: number, r: number, style: string) {
    this.context.beginPath();
    this.context.arc(x, y, r, 0, Math.PI*2);

    this.context.fillStyle = style;
    this.context.fill();
  }

  public drawText(text: string, x: number, y: number, style: string, font: string) {
    this.context.fillStyle = style;
    this.context.font = font;
    this.context.fillText(text, x, y);
  }

  private getScreenPos(x: number, y: number): number[] {
    return [
      this.width/2 + (x - this.cameraX)*this.scaleRatio,
      this.height/2 - (y - this.cameraY)*this.scaleRatio
    ]
  }

  public render() {
    this.context.clearRect(0, 0, this.width, this.height);

    const screenRect = new Rectangle(
      this.cameraX - this.range*this.aspectRatio,
      this.cameraX + this.range*this.aspectRatio,
      this.cameraY - this.range, 
      this.cameraY + this.range
    );

    const gridScale = 2**floor(Math.log2(this.range/DisplayMap.GRID_RANGE_FACTOR));
    const gridXMin = ceil(screenRect.x0, gridScale);
    const gridXMax = floor(screenRect.x1, gridScale);
    const gridYMin = ceil(screenRect.y0, gridScale);
    const gridYMax = floor(screenRect.y1, gridScale);

    MAP_GRID_SCALE.innerText = (gridScale*App.UNIT_SCALE).toString();

    for (let x = gridXMin; x <= gridXMax; x += gridScale) {
      const screenX = this.width/2 + (x - this.cameraX)*this.scaleRatio;

      let style = "rgba(255, 255, 255, 0.1)";
      let lineWidth = 1;

      if (x == 0) {
        style = "rgba(255, 255, 255, 0.25)";
        lineWidth = 2;

      } else if (x % (gridScale*4) == 0) {
        style = "rgba(255, 255, 255, 0.25)";
      }

      this.drawLine(screenX, 0, screenX, this.height, style, lineWidth);
    }

    for (let y = gridYMin; y <= gridYMax; y += gridScale) {
      const screenY = this.height/2 - (y - this.cameraY)*this.scaleRatio;

      let style = "rgba(255, 255, 255, 0.1)";
      let lineWidth = 1;

      if (y == 0) {
        style = "rgba(255, 255, 255, 0.25)";
        lineWidth = 2;

      } else if (y % (gridScale*4) == 0) {
        style = "rgba(255, 255, 255, 0.25)";
      }

      this.drawLine(0, screenY, this.width, screenY, style, lineWidth);
    }

    // Then, update your path-drawing code
    if (this.currentPath && this.currentPathDist) {
      for (let i = 0; i < this.currentPath.length; i++) {
        const [x0, y0] = this.getScreenPos(this.currentPath[i].x, this.currentPath[i].y);

        if (i < this.currentPath.length - 1) {
          const [x1, y1] = this.getScreenPos(this.currentPath[i + 1].x, this.currentPath[i + 1].y);

          this.drawLine(x0, y0, x1, y1, "rgb(255, 255, 255)", 5);

        } else {
          this.drawText(`Path Distance: ${round(this.currentPathDist*App.UNIT_SCALE)}m`, x0 + 14, y0, "rgb(150, 150, 150)", "12px Ubuntu");
        }

        this.drawCircle(x0, y0, 10, "#edab00");
      }
    }

    const zoomDepth = Math.log2(this.mapRect.h/this.range) + 1.5;
    const quadDepth = clamp(floor(zoomDepth), 0, DisplayMap.QT_SUBDIVISIONS);
    const restCount = floor(4**(zoomDepth - quadDepth));

    const quadList: number[] = [];
    const restList: number[] = [];

    this.visibleRests = restList;

    this.getQuadsInside(screenRect, quadDepth, quadList);

    for (let i = 0; i < quadList.length; i++) {
      const index = quadList[i];

      this.getRestaurantsInQuad(index, quadDepth, restCount, restList);
    }

    for (let i = 0; i < restList.length; i++) {
      const restIndex = restList[i];
      const [screenX, screenY] = this.getScreenPos(this.app.data.x[restIndex], this.app.data.y[restIndex]);

      this.context.drawImage(LOCATION_ICON, screenX - LOCATION_ICON.width/2, screenY - LOCATION_ICON.height, LOCATION_ICON.width, LOCATION_ICON.height);
      this.drawText(this.app.data.storeName[restIndex], screenX + LOCATION_ICON.width/2 + 4, screenY - LOCATION_ICON.width/2, "rgb(150, 150, 150", "16px Ubuntu");
    }

    const [userScreenX, userScreenY] = this.getScreenPos(this.app.locationX, this.app.locationY);

    this.drawCircle(userScreenX, userScreenY, 12,"#15ff0d");
  }

  private positionMapElement(element: HTMLDivElement, left: number, top: number) {
    const divWidth = element.offsetWidth;
    const divHeight = element.offsetHeight;

    left = clamp(left, 0, this.width);
    top = clamp(top, 0, this.height);

    if (left + divWidth > this.width) left -= divWidth;
    if (top + divHeight > this.height) top -= divHeight;

    element.style.left = left + "px";
    element.style.top = top + "px";
  }

  private displayRestaurantInfo(index: number, left: number, top: number) {
    const info = this.app.createRestaurantInfo(index);

    const div = document.createElement("div");
    div.className = "map-info";
    div.appendChild(info);

    MAP_CONTAINER.appendChild(div);

    this.infoDisplay = div;
    this.positionMapElement(div, left, top);
  }

  private clearInfo() {
    if (this.infoDisplay) {
      this.infoDisplay.remove();
      this.infoDisplay = null;
    }
  }

  private displayPositionInfo(left: number, top: number) {
    const x = (left - this.width/2)/this.scaleRatio + this.cameraX;
    const y = (this.height/2 - top)/this.scaleRatio + this.cameraY;

    MAP_INFO.hidden = false;
    MAP_INFO_POS.innerText = `(${round(x*App.UNIT_SCALE)}m, ${round(y*App.UNIT_SCALE)}m)`;

    this.positionInfoX = x;
    this.positionInfoY = y;
    this.positionMapElement(MAP_INFO, left, top);
  }

  private clearPositionInfo() {
    MAP_INFO.hidden = true;

    this.positionInfoX = null;
    this.positionInfoY = null;
  }

  private getClickedLocation(mouseX: number, mouseY: number): number {
    const visible = this.visibleRests;

    if (visible) {
      for (let i = 0; i < visible.length; i++) {
        const index = visible[i];
        const [screenX, screenY] = this.getScreenPos(this.app.data.x[index], this.app.data.y[index]);
        const diffX = abs(mouseX - screenX);
        const diffY = abs(mouseY - screenY + LOCATION_ICON.height/2);

        if (diffX <= LOCATION_ICON.width/2 && diffY <= LOCATION_ICON.height/2) {
          return index;
        }
      }
    }

    return -1;
  }

  private initInput() {
    let mouseX: number | null;
    let mouseY: number | null;

    new ResizeObserver(() => {
      this.setDimensions(MAP_CANVAS.getBoundingClientRect());
      this.render();

    }).observe(MAP_CANVAS);

    MAP_CANVAS.addEventListener("contextmenu", (event: MouseEvent) => {
      event.preventDefault();
    });

    MAP_CANVAS.addEventListener("mousedown", (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      MAP_CANVAS.classList.add("drag");

      this.clearInfo();
      this.clearPositionInfo();
    });

    MAP_CANVAS.addEventListener("mousemove", (event: MouseEvent) => {
      if (mouseX && mouseY) {
        const diffX = event.clientX - mouseX;
        const diffY = event.clientY - mouseY;

        mouseX = event.clientX;
        mouseY = event.clientY;

        const scaleRatio = this.height/(this.range*2);

        this.panCamera(-diffX/scaleRatio, diffY/scaleRatio);

      } else {
        const hoveredPlace = this.getClickedLocation(event.clientX - this.bounds.left, event.clientY - this.bounds.top);

        if (hoveredPlace > 0) MAP_CANVAS.classList.add("hover");
        else MAP_CANVAS.classList.remove("hover");
      }
    });

    MAP_CANVAS.addEventListener("mouseup", (event: MouseEvent) => {
      if (event.button == 0) {
        const clickedRest = this.getClickedLocation(event.clientX - this.bounds.left, event.clientY - this.bounds.top)

        if (clickedRest > 0) {
          const [screenX, screenY] = this.getScreenPos(this.app.data.x[clickedRest], this.app.data.y[clickedRest]);

          this.displayRestaurantInfo(clickedRest, screenX, screenY);
        }

      } else if (event.button == 2) {
        this.displayPositionInfo(event.clientX - this.bounds.left, event.clientY - this.bounds.top);
      }
    });

    document.addEventListener("mouseup", () => {
      MAP_CANVAS.classList.remove("drag");

      mouseX = null;
      mouseY = null;
    });

    MAP_CANVAS.addEventListener("wheel", (event: WheelEvent) => {
      this.changeZoom(event.deltaY);
      this.clearInfo();
    });

    MAP_SET_LOCATION.addEventListener("click", () => {
      if (this.positionInfoX && this.positionInfoY) {
        this.app.changeLocation(this.positionInfoX, this.positionInfoY);
      }
    });

    MAP_SET_DEST.addEventListener("click", () => {
      if (this.positionInfoX && this.positionInfoY) {
        this.app.destXTextbox.setValue(this.positionInfoX*App.UNIT_SCALE);
        this.app.destYTextbox.setValue(this.positionInfoY*App.UNIT_SCALE);
        this.app.pathDropdown.down();
      }
    });
  }
}
