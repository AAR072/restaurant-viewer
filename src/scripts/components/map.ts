const CANVAS = document.getElementById("map-canvas") as HTMLCanvasElement;

class Vector {

}

class DisplayMap {
    public cameraX: number = 1000;
    public cameraY: number = 1000;
    public range: number = 50;

    public loadedX: number;
    public loadedY: number;
    public loadedRange: number
    public loaded: Uint32Array;

    constructor(public app: App) {
        this.loadTargets();
        this.paint();
        this.initInput();
    }

    loadTargets() {
        const loadRange = this.range*3;

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

    checkForLoad() {
        if (Math.abs(this.cameraX - this.loadedX) > this.loadedRange || Math.abs(this.cameraY - this.loadedY) > this.loadedRange || this.range < this.loadedRange/3) {
            console.log("TEST");
            this.loadTargets();
        }
    }

    paint() {
        const width = CANVAS.width;
        const height = CANVAS.height;
        const aspectRatio = width/height;
        const context = CANVAS.getContext("2d") as CanvasRenderingContext2D;

        context.clearRect(0, 0, width, height);

        context.fillStyle = "red";
        context.fillRect(width/2 - width/this.range*0.5/2, height/2 - width/this.range*0.5, width/this.range*0.5, width/this.range*0.5);

        context.fillStyle = "black";

        for (let i = 0; i < this.loaded.length; i++) {
            const index = this.loaded[i];
            const xPos = this.app.data.x[index] - this.cameraX;
            const yPos = this.app.data.y[index] - this.cameraY;

            const screenX = width/2 + xPos/this.range*width/2;
            const screenY = height/2 - yPos/this.range*height/2;

            const size = width/this.range*0.5;

            context.fillRect(screenX - size/2, screenY - size/2, size, size);
        }

        const thickness = width/this.range*0.2;
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

        this.checkForLoad();
        this.paint();
    }

    zoomCamera(direction: boolean) {
        if (direction) this.range *= 1.1;
        else this.range /= 1.1;

        this.checkForLoad();
        this.paint();
    }

    initInput() {
        let mouseX: number | null;
        let mouseY: number | null;

        CANVAS.addEventListener("mousedown", (event: MouseEvent) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        CANVAS.addEventListener("mousemove", (event: MouseEvent) => {
            if (mouseX && mouseY) {
                const diffX = event.clientX - mouseX;
                const diffY = event.clientY - mouseY;

                mouseX = event.clientX;
                mouseY = event.clientY;

                this.moveCamera(-diffX*2*this.range/CANVAS.width, diffY*2*this.range/CANVAS.height);
            }
        });

        CANVAS.addEventListener("mouseup", () => {
            mouseX = null;
            mouseY = null;
        });

        CANVAS.addEventListener("wheel", (event: WheelEvent) => {
            this.zoomCamera(event.deltaY > 0);
        });
    }
}

new DisplayMap(app)