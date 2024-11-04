// const MAP_CONTAINER = document.getElementById("map-container") as HTMLDivElement;
// const MAP_CANVAS = document.getElementById("map-canvas") as HTMLCanvasElement;
// const MAP_GRID_SCALE = document.getElementById("map-grid-scale") as HTMLSpanElement;
// const MAP_POSITION_X = document.getElementById("map-position-x") as HTMLInputElement;
// const MAP_POSITION_Y = document.getElementById("map-position-y") as HTMLInputElement;

// const LOCATION_ICON = new Image();
// LOCATION_ICON.src = "assets/location-icon.png";

// class DisplayMap {
//   static CHUNK_SIZE = 64;

//   static ICON_SIZE = 24;
//   static TEXT_SIZE = 12;

//   static ZOOM_SPEED = 0.005;
//   static MIN_ZOOM = 1;
//   static MAX_ZOOM = 10;

//   static GRID_RANGE_FACTOR = 16;

//   public cameraX: number = 0;
//   public cameraY: number = 0;
//   public zoom: number = 5;
//   public range: number;

//   public context: CanvasRenderingContext2D;
//   public width: number;
//   public height: number;
//   public bounds: DOMRect;

//   public minX: number;
//   public minY: number;
//   public maxX: number;
//   public maxY: number;

//   public chunkColumns: number;
//   public chunkRows: number;
//   public chunkRestaurants: number[][];

//   public infoIndex: number | null = null;
//   public infoDisplay: HTMLDivElement | null = null;

//   constructor(public app: App) {
//     this.context = MAP_CANVAS.getContext("2d")!;
//     this.context.font = `${DisplayMap.TEXT_SIZE}px Ubuntu`;

//     this.width = MAP_CANVAS.width;
//     this.height = MAP_CANVAS.height;
//     this.bounds = MAP_CANVAS.getBoundingClientRect();
//     // listen to canvas resize for width, height and bounds

//     this.minX = app.data.x[app.sorted.x[0]];
//     this.minY = app.data.y[app.sorted.y[0]];
//     this.maxX = app.data.x[app.sorted.x[App.RESTAURANT_COUNT - 1]];
//     this.maxY = app.data.y[app.sorted.y[App.RESTAURANT_COUNT - 1]];

//     this.loadChunkData();
//     this.centerCamera();
//     this.setRange();
//     this.updateDisplay();
//     this.initInput();
//   }

//   public loadChunkData() {
//     const xRange = this.maxX - this.minX;
//     const yRange = this.maxY - this.minY;

//     this.chunkColumns = ceil(xRange/DisplayMap.CHUNK_SIZE);
//     this.chunkRows = ceil(yRange/DisplayMap.CHUNK_SIZE);

//     const chunkCount = this.chunkColumns*this.chunkRows;
//     const restaurantsPointers: Uint32Array = new Uint32Array(chunkCount);

//     this.chunkRestaurants = new Array(chunkCount);

//     for (let i = 0; i < App.RESTAURANT_COUNT; i++) {
//       const x = this.app.data.x[i];
//       const y = this.app.data.y[i];
//       const chunkX = floor(x/DisplayMap.CHUNK_SIZE);
//       const chunkY = floor(y/DisplayMap.CHUNK_SIZE);
//       const chunkIndex = chunkX*this.chunkColumns + chunkY;

//       if (!this.chunkRestaurants[chunkIndex]) {
//         this.chunkRestaurants[chunkIndex] = [];
//       }

//       this.chunkRestaurants[chunkIndex][restaurantsPointers[chunkIndex]++] = i;
//     }
//   }

//   public updateDisplay() {
//     const aspectRatio = this.width/this.height;
//     const scaleRatio = this.height/(this.range*2);

//     this.context.clearRect(0, 0, this.width, this.height);

//     this.context.fillStyle = "black";
//     this.context.strokeStyle = "black";

//     // fix this, ceil sometimes not working
//     const gridScale = 2**floor(Math.log2(this.range/DisplayMap.GRID_RANGE_FACTOR));
//     const gridXMin = ceil(this.cameraX - this.range*aspectRatio, gridScale);
//     const gridXMax = floor(this.cameraX + this.range*aspectRatio, gridScale);
//     const gridYMin = ceil(this.cameraY - this.range, gridScale);
//     const gridYMax = floor(this.cameraY + this.range, gridScale);

//     MAP_GRID_SCALE.innerText = (gridScale*App.UNIT_SCALE).toString();
//     MAP_POSITION_X.value = round(this.cameraX*App.UNIT_SCALE).toString();
//     MAP_POSITION_Y.value = round(this.cameraY*App.UNIT_SCALE).toString();

//     for (let x = gridXMin; x <= gridXMax; x += gridScale) {
//       const screenX = this.width/2 + (x - this.cameraX)*scaleRatio;

//       this.context.beginPath();
//       this.context.moveTo(screenX, 0);
//       this.context.lineTo(screenX, this.height);
//       this.context.stroke();
//     }

//     for (let y = gridYMin; y <= gridYMax; y += gridScale) {
//       const screenY = this.height/2 - (y - this.cameraY)*scaleRatio;

//       this.context.beginPath();
//       this.context.moveTo(0, screenY);
//       this.context.lineTo(this.width, screenY);
//       this.context.stroke();
//     }

//     const minX = this.cameraX - this.range*aspectRatio;
//     const maxX = this.cameraX + this.range*aspectRatio;
//     const minY = this.cameraY - this.range;
//     const maxY = this.cameraY + this.range;

//     let minChunkX = floor(minX/DisplayMap.CHUNK_SIZE);
//     let minChunkY = floor(minY/DisplayMap.CHUNK_SIZE);
//     let maxChunkX = floor(maxX/DisplayMap.CHUNK_SIZE);
//     let maxChunkY = floor(maxY/DisplayMap.CHUNK_SIZE);

//     minChunkX = clamp(minChunkX, 0, this.chunkColumns - 1);
//     maxChunkX = clamp(maxChunkX, 0, this.chunkColumns - 1);
//     minChunkY = clamp(minChunkY, 0, this.chunkRows - 1);
//     maxChunkY = clamp(maxChunkY, 0, this.chunkRows - 1);

//     // const chunkSkip = 2 ** floor(this.range / 500);
//     const restaurantSkip = getMax(1, 2**floor(this.zoom - 3));

//     this.context.strokeStyle = "red";

//     // idea: split screen into "cluster" regions

//     for (let x = minChunkX; x <= maxChunkX; x++) {
//       for (let y = minChunkY; y <= maxChunkY; y++) {
//         const chunkNumber = x*this.chunkColumns + y;
//         const restaurants = this.chunkRestaurants[chunkNumber];

//         const chunkMinX = x*DisplayMap.CHUNK_SIZE;
//         const chunkMinY = y*DisplayMap.CHUNK_SIZE;
//         const chunkSize = DisplayMap.CHUNK_SIZE;

//         const screenX = this.width/2 + (chunkMinX - this.cameraX)*scaleRatio;
//         const screenY = this.height/2 - (chunkMinY + chunkSize - this.cameraY)*scaleRatio;
//         const screenSize = chunkSize*scaleRatio;

//         this.context.strokeRect(screenX, screenY, screenSize, screenSize);

//         for (let i = 0; i < restaurants.length; i += restaurantSkip) {
//           const index = restaurants[i];

//           const xPos = this.app.data.x[index] - this.cameraX;
//           const yPos = this.app.data.y[index] - this.cameraY;

//           const screenX = this.width/2 + xPos*scaleRatio;
//           const screenY = this.height/2 - yPos*scaleRatio;

//           this.context.drawImage(LOCATION_ICON, screenX - DisplayMap.ICON_SIZE/2, screenY - DisplayMap.ICON_SIZE, DisplayMap.ICON_SIZE, DisplayMap.ICON_SIZE);
//           this.context.fillText(this.app.data.storeName[index], screenX + DisplayMap.ICON_SIZE/2, screenY - DisplayMap.ICON_SIZE/2);
//         }
//       }
//     }
//   }

//   public centerCamera() {
//     this.cameraX = (this.minX + this.maxX)/2;
//     this.cameraY = (this.minY + this.maxY)/2;
//   }

//   public setRange() {
//     this.range = 2**this.zoom;
//   }

//   public panCamera(x: number, y: number) {
//     this.cameraX = clamp(this.cameraX + x, this.minX, this.maxX);
//     this.cameraY = clamp(this.cameraY + y, this.minY, this.maxY);

//     this.updateDisplay();
//   }

//   public changeZoom(delta: number) {
//     this.zoom = clamp(this.zoom + delta*DisplayMap.ZOOM_SPEED, DisplayMap.MIN_ZOOM, DisplayMap.MAX_ZOOM);

//     this.setRange();
//     this.updateDisplay();
//   }

//   public createInfo(index: number, left: number, top: number) {
//     const div = document.createElement("div");
//     div.className = "map-info";
//     div.style.left = left + "px";
//     div.style.top = top + "px";

//     const id = document.createElement("p");
//     id.innerText = "ID: " + this.app.data.ID[index];

//     const name = document.createElement("p");
//     name.innerText = "Name: " + this.app.data.storeName[index];

//     const type = document.createElement("p");
//     type.innerText = "Type: " + this.app.data.type[index];

//     const cost = document.createElement("p");
//     cost.innerText = "Cost: $" + this.app.data.cost[index].toFixed(2);

//     const review = document.createElement("p");
//     review.innerText = "Review: " + this.app.data.review[index].toFixed(1);

//     const position = document.createElement("p");
//     position.innerText = `Position: (x: ${this.app.data.x[index]*App.UNIT_SCALE}m, y: ${this.app.data.y[index]*App.UNIT_SCALE}m)`

//     div.appendChild(id);
//     div.appendChild(name);
//     div.appendChild(type);
//     div.appendChild(cost);
//     div.appendChild(review);
//     div.appendChild(position);

//     MAP_CONTAINER.appendChild(div);

//     this.infoDisplay = div;
//   }

//   public initInput() {
//     let mouseX: number | null;
//     let mouseY: number | null;

//     MAP_CANVAS.addEventListener("contextmenu", (event: MouseEvent) => {
//       event.preventDefault();
//     });

//     MAP_CANVAS.addEventListener("mousedown", (event: MouseEvent) => {
//       mouseX = event.clientX;
//       mouseY = event.clientY;

//       if (this.infoIndex && this.infoDisplay) {
//         this.infoIndex = null;
//         this.infoDisplay.remove();
//       }

//       const scaleRatio = this.height/(this.range*2);

//       const screenX = event.clientX - this.bounds.left;
//       const screenY = event.clientY - this.bounds.top;
//       const actualX = this.cameraX + (screenX - this.width/2)/scaleRatio;
//       const actualY = this.cameraY + (this.height/2 - screenY)/scaleRatio;
//       const actualSize = DisplayMap.ICON_SIZE/scaleRatio*1.1;

//       const inRange = getIntersections([
//         filterNumbers(this.app.data.x, this.app.sorted.x, actualX - actualSize/2, actualX + actualSize/2),
//         filterNumbers(this.app.data.y, this.app.sorted.y, actualY - actualSize, actualY)
//       ], App.RESTAURANT_COUNT);

//       if (inRange.length > 0) {
//         const index = inRange[0];

//         const screenX = this.width/2 + (this.app.data.x[index] - this.cameraX)*scaleRatio;
//         const screenY = this.height/2 - (this.app.data.y[index] - this.cameraY)*scaleRatio;

//         this.createInfo(index, screenX - this.bounds.left, screenY - this.bounds.top);
//         this.infoIndex = index;

//         this.updateDisplay();
//       }
//     });

//     document.addEventListener("mousemove", (event: MouseEvent) => {
//       if (mouseX && mouseY) {
//         const diffX = event.clientX - mouseX;
//         const diffY = event.clientY - mouseY;

//         mouseX = event.clientX;
//         mouseY = event.clientY;

//         const scaleRatio = this.height/(this.range*2);

//         this.panCamera(-diffX/scaleRatio, diffY/scaleRatio);
//       }
//     });

//     document.addEventListener("mouseup", (event: MouseEvent) => {
//       mouseX = null;
//       mouseY = null;
//     });

//     MAP_CANVAS.addEventListener("wheel", (event: WheelEvent) => {
//       this.changeZoom(event.deltaY);
//     });
//   }
// }