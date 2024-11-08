// #region HTML elements
const MAP_CONTAINER = document.getElementById("map-container") as HTMLDivElement;
const MAP_CANVAS = document.getElementById("map-canvas") as HTMLCanvasElement;
const MAP_GRID_SCALE = document.getElementById("map-grid-scale") as HTMLSpanElement;

const MAP_INFO = document.getElementById("map-info") as HTMLDivElement;
const MAP_INFO_POS = document.getElementById("map-info-pos") as HTMLParagraphElement;
const MAP_SET_LOCATION = document.getElementById("map-set-location") as HTMLButtonElement;
const MAP_SET_DEST = document.getElementById("map-set-dest") as HTMLButtonElement;
// #endregion

const LOCATION_ICON = new Image();
LOCATION_ICON.src = "assets/location-icon.png";

/**
 * Generates a constant pseudo-random value for constant inputs.
 * @param seed The seed for the pseudo-random function.
 * @param index The quad index number, ranging from 0 to 3.
 * @returns A random value ranging from 0 to 3.
 * @timecomplexity O(1)
 */
function constantRandom(seed: number, index: number): number {
  const hash = (seed ^ (index*0x5bd1e995) ^ (seed << 16)) >>> 0;

  return (hash & 3);
}

/**
 * Randomly splits a number into 4 (equal when possible) parts.
 * @param count Number to split into 4.
 * @param seed The seed used to randomize the distribution of the split result (the quadtree index).
 * @returns A array of length 4, containing 4 values that sum to the count.
 * @timecomplexity O(1)
 */
function randomQuadSplit(count: number, seed: number): Uint32Array {
  const portions = new Uint32Array(4);
  const portion = floor(count/4);
  let remainder = count % 4;

  // Add the quarter portions to the array (initially not randomly distributed).
  for (let i = 0; i < 4; i++) {
    portions[i] = portion + (remainder > 0 ? 1 : 0);
    remainder--;
  }

  // Go through the array and randomly swap values with one another.
  for (let i = 0; i < 4; i++) {
    const newIndex = (i + constantRandom(seed, i)) % 4;
    const temp = portions[i];

    portions[i] = portions[newIndex];
    portions[newIndex] = temp;
  }

  return portions;
}

/** Represents a rectangle in a 2d coordinate system. */
class Rectangle {
  /** The width of the rectangle. */
  public w: number;
  /** The height of the rectangle. */
  public h: number;

  /**
   * Creates a rectangle based on min and max values for x and y coordinates.
   * @param x0 The x value of the bottom left corner.
   * @param x1 The x value of the top right corner.
   * @param y0 The y value of the bottom left corner.
   * @param y1 The y value of the top right corner.
   * @timecomplexity O(1)
   */
  constructor(
    public x0: number,
    public x1: number,
    public y0: number,
    public y1: number
  ) {
    this.w = this.x1 - this.x0;
    this.h = this.y1 - this.y0;
  }

  /**
   * Determines whether or not two rectangles intersect.
   * @param rect The other rectangle.
   * @returns True if they intersect, false if they do not.
   * @timecomplexity O(1)
   */
  public intersects(rect: Rectangle): boolean {
    if (this.x1 <= rect.x0 || this.x0 >= rect.x1) return false;
    if (this.y1 <= rect.y0 || this.y0 >= rect.y1) return false;

    return true;
  }
}

/** Starts a cancellable animation, passing the lerp progress value into the animation callback every frame. */
class MapAnimation {
  private active: boolean = true;
  /** The linear animation progress, 0 being just started and 1 being complete. */
  public progress: number = 0;
  private lastTime: number;

  /**
   * Creates and initializes the animation.
   * @param callback The callback function for the animation, used to lerp between start and end goal based on progress parameter.
   * @param duration The duration of the animation in seconds.
   * @timecomplexity O(1)
   */
  constructor(
    private callback: (progress: number) => any,
    private duration: number = 2
  ) {
    requestAnimationFrame((timeStamp: number) => {
      this.lastTime = timeStamp;
      this.animationStep(timeStamp);
    });
  }

  /**
   * Creates easing style and direction affected progress based on the linear progress of the animation.
   * @returns Animation progress with cubic easing style and inout easing direction applied.
   * @timecomplexity O(1)
   */
  private getTimeProgress(): number {
    if (this.progress > 0.5) return 1/2*((this.progress - 1)*2)**3 + 1;
    else return 1/2*(this.progress*2)**3;
  }

  /**
   * Increases linear progress of animation based on difference between the current time and the last frame time and the animation duration.
   * @param time Current timestamp used to calculate delta time.
   * @timecomplexity O(1)
   */
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

  /**
   * Stops the animation.
   * @timecomplexity O(1)
   */
  public cancel() {
    this.active = false;
  }
}

/** Represents the application's map, storing all relevant properties and methods. */
class DisplayMap {
  static ZOOM_SPEED: number = 0.001;
  static MIN_ZOOM: number = 1;
  static MAX_ZOOM: number = 11;

  /** Amount of grid squares for half the height of the screen. */
  static GRID_RANGE_FACTOR: number = 16;
  /** Affects the amount of restaurants displayed on the screen. */
  static DISPLAY_COUNT_FACTOR: number = 1.7;
  /** Amount of quadtree subdivisions. */
  static QT_SUBDIVISIONS: number = 6;

  public cameraX: number = 0;
  public cameraY: number = 0;
  public zoom: number = 4;

  /** The unit range to be displayed by one half the height of the screen. */
  public range: number;
  /** Factor used to normalize the data coordinate system to pixels and vice versa. */
  public scaleRatio: number;
  /** Aspect ratio of the screen (width divided by height). */
  public aspectRatio: number;

  public context: CanvasRenderingContext2D;
  public width: number;
  public height: number;
  public bounds: DOMRect;

  /** The rectangle of the map, using the minimum and maximum x and y values of the data as bounds. */
  public mapRect: Rectangle;

  /** The quadtree array, using rectangles to represent each quad. */
  public quadTree: Rectangle[];
  /** The amount of quads in the quadtree. */
  public qtSize: number;
  /** The amount of leaves in the quadtree. */
  public qtLeaves: number;
  /** The restaurants contained each leaf for all of the leaves. */
  public qtRestaurants: number[][];
  public qtLeafSizeX: number;
  public qtLeafSizeY: number;

  /** Currently displayed restaurants, based on the last render call. */
  public visibleRests: number[];
  public infoDisplay: HTMLDivElement | null = null;
  public positionInfoX: number | null = null;
  public positionInfoY: number | null = null;

  public animation: MapAnimation | null = null;

  public currentPath: TNode[] | null = null;
  public currentPathDist: number | null = null;

  /**
   * Creates a new display map instance, loading the quadtree and performing the first render call.
   * @param app The app instance tied to the map
   * @timecomplexity O(n)
   */
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

    if (!LOCATION_ICON.complete) {
      LOCATION_ICON.onload = () => this.render();

    } else {
      this.render();
    }
  }

  /**
   * Uses the morton/z-curve index method and bit interleaving to find the quad leaf containing a point.
   * @param x Point x value.
   * @param y Point y value.
   * @returns The index of the quad leaf containing the point (`x`, `y`).
   * @timecomplexity O(1)
   */
  private getQuadLeaf(x: number, y: number): number {
    const gridX = floor(x/this.qtLeafSizeX); // Round x coordinate to leaf grid
    const gridY = floor(y/this.qtLeafSizeY); // Round y coordinate to leaf grid

    let index = 0;

    // Interleave gridX and gridY bits to find quad leaf index
    for (let i = 0; i < DisplayMap.QT_SUBDIVISIONS; i++) {
      const xBit = (gridX >> i) & 1;
      const yBit = (gridY >> i) & 1;

      index |= (xBit << (2*i)) | (yBit << (2*i + 1));
    }

    return index;
  }

  /**
   * Loads all of the quad tree rectangles and the restaurants contained in each leaf.
   * @timecomplexity O(n)
   */
  private loadQuadTree() {
    this.qtSize = geoSeries(4, DisplayMap.QT_SUBDIVISIONS + 1);
    this.qtLeaves = 4**DisplayMap.QT_SUBDIVISIONS;
    this.quadTree = new Array(this.qtSize);
    this.qtRestaurants = new Array(this.qtLeaves);
    this.qtLeafSizeX = this.mapRect.w/(1 << DisplayMap.QT_SUBDIVISIONS);
    this.qtLeafSizeY = this.mapRect.h/(1 << DisplayMap.QT_SUBDIVISIONS);

    this.subdivideQuads(this.mapRect); // O(1) since subdivision count is constant

    const restaurantPointers = new Uint32Array(this.qtLeaves);

    for (let i = 0; i < App.RESTAURANT_COUNT; i++) {
      const index = this.getQuadLeaf(this.app.data.x[i], this.app.data.y[i]);

      if (!this.qtRestaurants[index]) this.qtRestaurants[index] = [];

      this.qtRestaurants[index][restaurantPointers[index]++] = i;
    }
  }

  /**
   * Recursively subdivides a given quad `count` amount of times.
   * @param quad The quad rectangle being subdivided.
   * @param index The index of the quad being subdivided.
   * @param count The amount of subdivisions left.
   * @timecomplexity O(4^n)
   */
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

  /**
   * 
   * @param target The target rectangle in which all quads inside are found.
   * @param desiredDepth The desired depth of the quads found inside the target.
   * @param quadList The array in which valid quads are inserted into.
   * @param index The current quad' index.
   * @param depth The current quad's depth.
   * @returns 
   */
  private getQuadsInside(target: Rectangle, desiredDepth: number, quadList: number[], index: number = 0, depth: number = 0) {
    const quad = this.quadTree[index];

    if (!target.intersects(quad)) return; // Break if the quad does not intersect the target rectangle

    if (depth == desiredDepth) {
      quadList[quadList.length] = index;

      return;
    }

    index *= 4;
    depth++;

    // Recurse into the subquads of the quad
    this.getQuadsInside(target, desiredDepth, quadList, index + 1, depth);
    this.getQuadsInside(target, desiredDepth, quadList, index + 2, depth);
    this.getQuadsInside(target, desiredDepth, quadList, index + 3, depth);
    this.getQuadsInside(target, desiredDepth, quadList, index + 4, depth);
  }

  /**
   * Finds `restCount` amount of restaurants in a quad and adds them to the `restList` array.
   * @param index The index of the quad.
   * @param depth The depth of the quad.
   * @param restCount The amount of restaurants needed.
   * @param restList The list of restaurants selected in the quad.
   * @timecomplexity O(4^n), where n is the difference between `depth` and `QT_SUBDIVISIONS`.
   */
  private getRestaurantsInQuad(index: number, depth: number, restCount: number, restList: number[]) {
    if (restCount <= 0) return;

    // Add the necessary amount of restaurants to the array once leaf quad is reached
    if (depth == DisplayMap.QT_SUBDIVISIONS) {
      const quadRestaurants = this.qtRestaurants[index - this.qtSize + this.qtLeaves];
      const restLen = quadRestaurants.length;

      for (let i = 0; i < restCount; i++) {
        if (i >= restLen) break;

        restList[restList.length] = quadRestaurants[i];
      }

      return;
    }

    const parts = randomQuadSplit(restCount, index); // Get randomly distributed portions of the required restaurants left

    index *= 4;
    depth++;

    // Recurse into the current quad's subquads with a portion of the restaurant count
    this.getRestaurantsInQuad(index + 1, depth, parts[0], restList);
    this.getRestaurantsInQuad(index + 2, depth, parts[1], restList);
    this.getRestaurantsInQuad(index + 3, depth, parts[2], restList);
    this.getRestaurantsInQuad(index + 4, depth, parts[3], restList);
  }

  /**
   * Sets the width, height, bounds and aspect ratio of the display map based on the canvas's DOM rectangle.
   * @param rect The DOM Rect of the map canvas
   * @timecomplexity O(1)
   */
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

  /**
   * Sets the range and scale ratio of the display map based on the zoom and the height of the map canvas.
   * @timecomplexity O(1)
   */
  private setRangeScale() {
    this.range = 2**this.zoom;
    this.scaleRatio = this.height/(this.range*2);
  }

  /**
   * Changes the position of the camera based on `deltaX` and `deltaY` values and renders the update.
   * @param deltaX The change in camera x position
   * @param deltaY The change in camera y position
   * @timecomplexity O(1)
   */
  public panCamera(deltaX: number, deltaY: number) {
    this.clearAnimation();

    this.cameraX += deltaX;
    this.cameraY += deltaY;

    this.render();
  }

  /**
   * Changes the map's zoom level and renders the change.
   * @param delta Amount to change the zoom by.
   * @timecomplexity O(1)
   */
  public changeZoom(delta: number) {
    this.clearAnimation();

    this.zoom = clamp(this.zoom + delta*DisplayMap.ZOOM_SPEED, DisplayMap.MIN_ZOOM, DisplayMap.MAX_ZOOM);

    this.setRangeScale();
    this.render();
  }

  /**
   * Creates and plays a new animation, lerping the current camera position and zoom to the goal position and zoom as it progresses.
   * @param goalX The goal position x value.
   * @param goalY The goal position y value.
   * @param goalZoom The goal zoom level, defaulting to the minimum zoom.
   * @timecomplexity O(1)
   */
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

  /**
   * Cancels and clears the currently active animation if existing.
   * @timecomplexity O(1)
   */
  public clearAnimation() {
    if (this.animation) {
      this.animation.cancel();
      this.animation = null;
    }
  }

  /**
   * Animates the camera to the position of the restaurant, specified by `index`, on the map.
   * @param index The index of the restaurant.
   */
  public viewRestaurant(index: number) {
    const x = this.app.data.x[index];
    const y = this.app.data.y[index];

    this.animateCamera(x, y);
  }

  /**
   * Sets the current path of the map to the specified `path` for rendering and animates the camera to its last node.
   * @param path The array of nodes of the path.
   * @param dist The total distance of the path.
   * @timecomplexity O(1)
   */
  public setPath(path: TNode[], dist: number) {
    const last = path[path.length - 1];

    this.currentPath = path;
    this.currentPathDist = dist;
    this.render();
    this.animateCamera(last.x, last.y);
  }

  /**
   * Clears the current path if existing and renders the change.
   * @timecomplexity O(1)
   */
  public clearPath() {
    if (this.currentPath && this.currentPathDist) {
      this.currentPath = null;
      this.currentPathDist = null;
      this.render();
    }
  }

  /**
   * Draws a line onto the map canvas based on the specified parameters.
   * @param x0 Start x position of the line.
   * @param y0 Start y position of the line.
   * @param x1 End x position of the line.
   * @param y1 End y position of the line.
   * @param style Stroke style of the line.
   * @param width Pixel width of the line.
   * @timecomplexity O(1)
   */
  private drawLine(x0: number, y0: number, x1: number, y1: number, style: string, width: number) {
    this.context.beginPath();
    this.context.moveTo(x0, y0);
    this.context.lineTo(x1, y1);

    this.context.strokeStyle = style;
    this.context.lineWidth = width;
    this.context.stroke();
  }

  /**
   * Draws a circle onto the map canvas based on the specified parameters.
   * @param x Center x position of the circle.
   * @param y Center y position of the circle.
   * @param r Pixel radius of the circle.
   * @param style Fill style of the circle.
   * @timecomplexity O(1)
   */
  public drawCircle(x: number, y: number, r: number, style: string) {
    this.context.beginPath();
    this.context.arc(x, y, r, 0, Math.PI*2);

    this.context.fillStyle = style;
    this.context.fill();
  }

  /**
   * Draws text onto the map canvas based on the specified parameters.
   * @param text The text to draw.
   * @param x The x position of the text's origin.
   * @param y The y position of the text's origin.
   * @param style The fill style of the text.
   * @param font The font and size of the text.
   * @timecomplexity O(1)
   */
  public drawText(text: string, x: number, y: number, style: string, font: string) {
    this.context.fillStyle = style;
    this.context.font = font;
    this.context.fillText(text, x, y);
  }

  /**
   * Gets the screen position of a point (`x`, `y`).
   * @param x The x position.
   * @param y The y position.
   * @returns An array holding the calculated screen x and y positions.
   * @timecomplexity O(1)
   */
  private getScreenPos(x: number, y: number): number[] {
    return [
      this.width/2 + (x - this.cameraX)*this.scaleRatio,
      this.height/2 - (y - this.cameraY)*this.scaleRatio
    ]
  }

  /**
   * Renders grid lines, restaurants markers, current path, and current location onto the map canvas.
   * @timecomplexity O(1), since `QT_SUBDIVISIONS` is constant.
   */
  public render() {
    this.context.clearRect(0, 0, this.width, this.height);

    const screenRect = new Rectangle(
      this.cameraX - this.range*this.aspectRatio,
      this.cameraX + this.range*this.aspectRatio,
      this.cameraY - this.range, 
      this.cameraY + this.range
    );

    const gridScale = 2**floor(Math.log2(this.range/DisplayMap.GRID_RANGE_FACTOR)); // Get unit scale of grid squares based on zoom level

    // Round to nearest grid lines
    const gridXMin = ceil(screenRect.x0, gridScale);
    const gridXMax = floor(screenRect.x1, gridScale);
    const gridYMin = ceil(screenRect.y0, gridScale);
    const gridYMax = floor(screenRect.y1, gridScale);

    MAP_GRID_SCALE.innerText = (gridScale*App.UNIT_SCALE).toString();

    // Draw vertical grid lines
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

    // Draw horizontal grid lines
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

    if (this.currentPath && this.currentPathDist) {
      // Draw current path nodes and lines between them
      for (let i = 0; i < this.currentPath.length; i++) {
        const [x0, y0] = this.getScreenPos(this.currentPath[i].x, this.currentPath[i].y);

        if (i < this.currentPath.length - 1) {
          const [x1, y1] = this.getScreenPos(this.currentPath[i + 1].x, this.currentPath[i + 1].y);

          this.drawLine(x0, y0, x1, y1, "white", 5);

        } else {
          this.drawText(`Path Distance: ${round(this.currentPathDist*App.UNIT_SCALE)}m`, x0 + 14, y0, "rgb(150, 150, 150)", "12px Ubuntu");
        }

        if (i == 0 || i == this.currentPath.length - 1) {
          this.drawCircle(x0, y0, 12, "#edab00");
        } else {
          this.drawCircle(x0, y0, 10, "#259afa");
        }
      }
    }

    // Calculate the zoom depth logarithmically based the size of the visible range relative to the screen, affecting the amount of restaurants displayed
    const zoomDepth = Math.log2(this.mapRect.h/this.range) + DisplayMap.DISPLAY_COUNT_FACTOR;
    const quadDepth = clamp(floor(zoomDepth), 0, DisplayMap.QT_SUBDIVISIONS); // Calculate depth of quads to include
    const restCount = floor(4**(zoomDepth - quadDepth)); // Get amount of restaurants to display per quad based on remainder of depth

    const quadList: number[] = [];
    const restList: number[] = [];

    this.visibleRests = restList;

    this.getQuadsInside(screenRect, quadDepth, quadList); // Add quads on screen to quad list array

    for (let i = 0; i < quadList.length; i++) {
      const index = quadList[i];

      this.getRestaurantsInQuad(index, quadDepth, restCount, restList); // Add restaurants in quad to restaurant array
    }

    // Draw all restaurants in restaurants array
    for (let i = 0; i < restList.length; i++) {
      const restIndex = restList[i];
      const [screenX, screenY] = this.getScreenPos(this.app.data.x[restIndex], this.app.data.y[restIndex]);

      // Position marker marker above restaurant position and text to the right of the marker
      this.context.drawImage(LOCATION_ICON, screenX - LOCATION_ICON.width/2, screenY - LOCATION_ICON.height, LOCATION_ICON.width, LOCATION_ICON.height);
      this.drawText(this.app.data.storeName[restIndex], screenX + LOCATION_ICON.width/2 + 4, screenY - LOCATION_ICON.width/2, "rgb(150, 150, 150", "16px Ubuntu");
    }

    // Draw user location
    const [userScreenX, userScreenY] = this.getScreenPos(this.app.locationX, this.app.locationY);
    this.drawCircle(userScreenX, userScreenY, 12,"#15ff0d");
  }

  /**
   * Positions an element to a specific location on the map.
   * @param element The absolutely positioned element to be positioned on the map.
   * @param left The amount of pixels horizontally from the top left corner of the map canvas to position the element at.
   * @param top The amount of pixels vertically from the top left corner of the map canvas to position the element at.
   * @timecomplexity O(1)
   */
  private positionMapElement(element: HTMLDivElement, left: number, top: number) {
    const divWidth = element.offsetWidth;
    const divHeight = element.offsetHeight;

    // Clamp values so that they do not exceed screen size
    left = clamp(left, 0, this.width);
    top = clamp(top, 0, this.height);

    // Shift element if necessary so that it does not clip over the screen
    if (left + divWidth > this.width) left -= divWidth;
    if (top + divHeight > this.height) top -= divHeight;

    element.style.left = left + "px";
    element.style.top = top + "px";
  }

  /**
   * Displays a restaurant's info at a specific position on the map.
   * @param index The restaurant index.
   * @param left Distance from left side to position info at.
   * @param top Distance from top to position info at.
   * @timecomplexity O(1)
   */
  private displayRestaurantInfo(index: number, left: number, top: number) {
    const info = this.app.createRestaurantInfo(index);

    const div = document.createElement("div");
    div.className = "map-info";
    div.appendChild(info);

    MAP_CONTAINER.appendChild(div);

    this.infoDisplay = div;
    this.positionMapElement(div, left, top);
  }

  /**
   * Clears currently displayed restaurant info if existent.
   * @timecomplexity O(1)
   */
  private clearInfo() {
    if (this.infoDisplay) {
      this.infoDisplay.remove();
      this.infoDisplay = null;
    }
  }

  /**
   * Displays general positional information and controls on the map.
   * @param left Distance from left side to position info at.
   * @param top Distance from top to position info at.
   * @timecomplexity O(1)
   */
  private displayPositionInfo(left: number, top: number) {
    // Getting real unit x and y positions based on pixels
    const x = (left - this.width/2)/this.scaleRatio + this.cameraX;
    const y = (this.height/2 - top)/this.scaleRatio + this.cameraY;

    MAP_INFO.hidden = false;
    MAP_INFO_POS.innerText = `(${round(x*App.UNIT_SCALE)}m, ${round(y*App.UNIT_SCALE)}m)`;

    this.positionInfoX = x;
    this.positionInfoY = y;
    this.positionMapElement(MAP_INFO, left, top);
  }

  /**
   * Clears currently displayed positional info if existent.
   * @timecomplexity O(1)
   */
  private clearPositionInfo() {
    MAP_INFO.hidden = true;

    this.positionInfoX = null;
    this.positionInfoY = null;
  }

  /**
   * Gets the index of the restaurant within range of the mouse.
   * @param mouseX The mouse's x position.
   * @param mouseY The mouse's y position.
   * @returns The index of the restaurant within range, or -1 if none exist.
   */
  private getClickedLocation(mouseX: number, mouseY: number): number {
    const visible = this.visibleRests;

    if (visible) {
      for (let i = 0; i < visible.length; i++) {
        const index = visible[i];
        const [screenX, screenY] = this.getScreenPos(this.app.data.x[index], this.app.data.y[index]);
        const diffX = abs(mouseX - screenX);
        const diffY = abs(mouseY - screenY + LOCATION_ICON.height/2);

        // Check if the difference between the mouse and the restaurant icon is within the icon's size
        if (diffX <= LOCATION_ICON.width/2 && diffY <= LOCATION_ICON.height/2) {
          return index;
        }
      }
    }

    return -1;
  }

  /**
   * Initializes all event listeners and similar things related to the elements of the map.
   * @timecomplexity O(1)
   */
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
      if (mouseX && mouseY) { // Mouse is clicked down and camera can be dragged
        const diffX = event.clientX - mouseX;
        const diffY = event.clientY - mouseY;

        mouseX = event.clientX;
        mouseY = event.clientY;

        const scaleRatio = this.height/(this.range*2);

        this.panCamera(-diffX/scaleRatio, diffY/scaleRatio);

      } else { // Display pointer cursor when hovering over restaurant icons
        const hoveredPlace = this.getClickedLocation(event.clientX - this.bounds.left, event.clientY - this.bounds.top);

        if (hoveredPlace > 0) MAP_CANVAS.classList.add("hover");
        else MAP_CANVAS.classList.remove("hover");
      }
    });

    MAP_CANVAS.addEventListener("mouseup", (event: MouseEvent) => {
      if (event.button == 0) { // Display restaurant info if restaurant has been clicked
        const clickedRest = this.getClickedLocation(event.clientX - this.bounds.left, event.clientY - this.bounds.top)

        if (clickedRest > 0) {
          const [screenX, screenY] = this.getScreenPos(this.app.data.x[clickedRest], this.app.data.y[clickedRest]);

          this.displayRestaurantInfo(clickedRest, screenX, screenY);
        }

      } else if (event.button == 2) { // Display position info if right clicked
        this.displayPositionInfo(event.clientX - this.bounds.left, event.clientY - this.bounds.top);
      }
    });

    document.addEventListener("mouseup", () => {
      MAP_CANVAS.classList.remove("drag");

      mouseX = null;
      mouseY = null;
    });

    // Prevent zooming in
    document.addEventListener("wheel", (event: WheelEvent) => {
      if (event.ctrlKey) event.preventDefault();
    }, {passive: false});

    MAP_CANVAS.addEventListener("wheel", (event: WheelEvent) => {
      this.changeZoom(event.deltaY);
      this.clearInfo();
    });

    MAP_SET_LOCATION.addEventListener("click", () => {
      // Set user location when the position info set location button has been pressed
      if (this.positionInfoX && this.positionInfoY) {
        this.app.changeLocation(this.positionInfoX, this.positionInfoY);
      }
    });

    MAP_SET_DEST.addEventListener("click", () => {
      // Set path search destination coordinates when the position info set dest button has been pressed
      if (this.positionInfoX && this.positionInfoY) {
        this.app.destXTextbox.setValue(this.positionInfoX*App.UNIT_SCALE);
        this.app.destYTextbox.setValue(this.positionInfoY*App.UNIT_SCALE);
        this.app.pathDropdown.down();
      }
    });
  }
}
