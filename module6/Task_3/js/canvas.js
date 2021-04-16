export default class Canvas {

    cnvs;
    cnvContainer;
    /** @type {CanvasRenderingContext2D[]} */
    ctxs;
    brushSize;
    scaleSize;

    circles;

    constructor(cnvs, cnvContainer, brushSize) {
        this.cnvs = cnvs;
        this.cnvContainer = cnvContainer;
        this.ctxs = [];
        for (const cnv of this.cnvs) {
            this.ctxs.push(cnv.getContext('2d'));
        }
        this.resize();

        this.brushSize = brushSize;

        this.circles = [];
        this.reset();
    }

    resize() {
        for (const cnv of this.cnvs) {
            cnv.width = this.cnvContainer.clientWidth;
            cnv.height = this.cnvContainer.clientHeight;
        }
    }

    reset() {
        for (const ctx of this.ctxs) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
        this.circles = [];
    }

    redraw(i) {
        for (const circle of this.circles) {
            this.drawCircle(i, circle.x, circle.y, this.brushSize / 2, "white");
        }
    }

    static distanceSqr(x1, y1, x2, y2) {
        return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
    }

    addCircle(i, x, y) {
        const minDist = this.brushSize * this.brushSize * 2;
        for (const circle of this.circles) {
            if (Canvas.distanceSqr(circle.x, circle.y, x, y) < minDist) {
                return;
            }
        }
        const ctx = this.ctxs[i];
        this.circles.push({ x, y });
        this.drawCircle(i, x, y, this.brushSize / 2, "white");
    }

    drawCircle(i, x, y, r, color) {
        const ctx = this.ctxs[i];
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawLines(i, route) {
        const ctx = this.ctxs[i];
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(route[0].x, route[0].y);
        for (const coord of route) {
            ctx.lineTo(coord.x, coord.y);
        }
        ctx.stroke();
    }

    /*
    isPaint;
    startPaint(event) {
        //console.log('start');
        this.isPaint = true;
        this.continuePaint(event);
        //paintColor = !pic[y][x];
        //pic[y][x] = paintColor;


        //redraw();
    }

    continuePaint(event) {
        if (this.isPaint) {
            const [x, y] = this.calcCoord(event.pageX, event.pageY);
            const ctx = this.ctx;
            ctx.beginPath();
            ctx.arc(x, y, this.brushSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    }

    movePaint(event) {
        //console.log('move');
        if (this.isPaint) {
            const [x, y] = this.calcCoord(event.pageX, event.pageY);
            // pic[y][x] = paintColor;
            // redraw();
            const ctx = this.ctx;
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    }

    endPaint(event) {
        //console.log('end');
        if (this.isPaint) {
            this.pausePaint(event);
            this.isPaint = false;
        }
    }

    pausePaint(event) {
        if (this.isPaint) {
            const [x, y] = this.calcCoord(event.pageX, event.pageY);
            const ctx = this.ctx;
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.closePath();
        }
    }
    */
}