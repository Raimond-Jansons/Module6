import NN from './nn.js';
import trained_nn from './trained28x28.js'

const linAlg = linearAlgebra(),
    Matrix = linAlg.Matrix;
// window.nn = nn;
// window.test_on_ds = test_on_ds;


class Canvas {

    /** @type {CanvasRenderingContext2D} */
    ctx;
    cnv;
    cnsSize;
    picSize;
    brushSize;
    scaleSize;
    cnv28;
    /** @type {CanvasRenderingContext2D} */
    ctx28;

    constructor(id, cnvSize, picSize, initBrushSize) {
        this.cnv = document.getElementById(id);
        this.cnv.width = picSize;
        this.cnv.height = picSize;
        this.cnsSize = cnvSize;
        this.picSize = picSize;
        this.brushSize = initBrushSize;
        this.ctx = this.cnv.getContext('2d');
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.scaleSize = cnvSize / picSize;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.strokeStyle = `#fff`;
        this.reset();

        this.cnv28 = document.getElementById('cnv28x28');
        this.cnv28.width = 28;
        this.cnv28.height = 28;
        this.ctx28 = this.cnv28.getContext('2d');
    }

    reset() {
        // this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        //this.drawGrid();
        this.ctx.clearRect(0, 0, this.cnsSize, this.cnsSize);
        //this.ctx.scale(this.scaleSize, this.scaleSize);
        //pic = Array(PIC_SIZE).fill().map(() => Array(PIC_SIZE).fill(false)); //matrix 5x5
    }

    drawGrid() {
        const ctx = this.ctx;
        const cellSize = this.cnsSize / this.picSize;
        ctx.clearRect(0, 0, this.cnsSize, this.cnsSize);
        ctx.lineWidth = 1;

        ctx.strokeStyle = `#aaa`;
        ctx.beginPath();
        for (let i = 1; i < this.picSize; i++) {
            ctx.moveTo(0, cellSize * i)
            ctx.lineTo(this.cnsSize, cellSize * i);
            ctx.moveTo(cellSize * i, 0)
            ctx.lineTo(cellSize * i, this.cnsSize);
        }
        ctx.stroke();
        ctx.closePath();
        ctx.lineWidth = this.brushSize;
        ctx.strokeStyle = `#000`;
    }

    calcCoord(x, y) {
        let k = this.scaleSize;
        return [(x - this.cnv.offsetLeft) / k, (y - this.cnv.offsetTop) / k];
    }

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

    getPixels() {
        const imageData = this.ctx.getImageData(0, 0, this.picSize, this.picSize).data;
        const pixels = [];
        for (let i = 0; i < imageData.length; i += 4) {
            pixels.push(imageData[i + 3] / 255);
        }
        return pixels;
    }

    getPixels28() {
        const imageData = this.ctx28.getImageData(0, 0, 28, 28).data;
        const pixels = [];
        for (let i = 0; i < imageData.length; i += 4) {
            pixels.push(imageData[i + 3] / 255);
        }
        return pixels;
    }

    crop28x28Img() {
        const imageData = this.ctx.getImageData(0, 0, this.picSize, this.picSize).data;
        let minX = this.picSize,
            minY = this.picSize,
            maxX = -1,
            maxY = -1;

        let sumX = 0, sumY = 0, sumPixels = 0;
        for (let y = 0; y < this.picSize; y++) {
            for (let x = 0; x < this.picSize; x++) {
                const pixel = imageData[(y * this.picSize * 4) + (x * 4) + 3] / 255;
                if (pixel > 0.7) {
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                }
                sumX += pixel * x;
                sumY += pixel * y;
                sumPixels += pixel;
            }
        }
        const meanX = sumX / sumPixels,
            meanY = sumY / sumPixels;

        const maxSize = Math.max(maxX - minX, maxY - minY) * 1.5;

        console.log(maxSize, meanX, meanY);

        this.ctx28.clearRect(0, 0, 28, 28);
        this.ctx28.imageSmoothingQuality = 'high';
        this.ctx28.drawImage(this.cnv, meanX - maxSize / 2, meanY - maxSize / 2, maxSize, maxSize, 0, 0, 28, 28);
    }
}


const CANVAS_SIZE = 500;
const PIC_SIZE = 50;
const CELL_SIZE = CANVAS_SIZE / PIC_SIZE;
const BRUSH_SIZE = 2;

const canvas = new Canvas('canvas', CANVAS_SIZE, PIC_SIZE, BRUSH_SIZE);


const answerSpan = document.getElementById('answer');

canvas.cnv.onmousedown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    canvas.startPaint(e);
}

canvas.cnv.onmousemove = (e) => {
    canvas.movePaint(e);
}

canvas.cnv.onmouseleave = (e) => {
    canvas.pausePaint(e);
}

canvas.cnv.onmouseenter = (e) => {
    canvas.continuePaint(e);
}

document.onmouseup = (e) => {
    canvas.endPaint(e);
    canvas.crop28x28Img();
    const pic = canvas.getPixels28();
    if ((new Matrix(pic)).getSum() > 7) {
        const predicted = NN.ind_of_max(nn.predict(pic));
        console.log(predicted);
        answerSpan.textContent = 'Ответ: ' + predicted;
    } else {
        answerSpan.textContent = 'Ответ: убил';
    }

}

document.getElementById('clearBtn').onclick = () => {
    canvas.reset();
}

function intToVector(a) {
    const arr = Array(10).fill(0);
    arr[+a] = 1;
    return arr;
}

const examples = JSON.parse(localStorage.getItem('examples') ?? '[]');
const digitInput = document.getElementById('digit');

document.getElementById('addExampleBtn').onclick = () => {
    examples.push({ input: canvas.getPixels(), output: intToVector(digitInput.value) })
    localStorage.setItem('examples', JSON.stringify(examples));
    canvas.reset();
};


const nn = new NN([784, 50, 10]);
nn.readFromJson(trained_nn);

// let set = mnist.set(8000, 2000);

// let trainingSet = set.training;
// let testSet = set.test;
let epochs = 1000;
let batch_size = 10;
let lr = 3;

const epochsInp = document.getElementById('epochs');
document.getElementById('trainBtn').onclick = () => {
    epochs = +epochsInp.value;
    nn.train(examples, examples, epochs, batch_size, lr);
};

document.getElementById('saveBtn').onclick = () => {
    nn.saveToFile();
};

const dropbox = document.getElementById("dropbox");
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragleave", dragleave, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
    this.classList.add('over');
}

function dragleave(e) {
    e.stopPropagation();
    e.preventDefault();
    this.classList.remove('over');
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();
    this.classList.remove('over');

    const dt = e.dataTransfer;
    const files = dt.files;

    let reader = new FileReader();
    reader.readAsText(files[0]);
    reader.onload = function () {
        nn.readFromJson(JSON.parse(reader.result));
    };

    reader.onerror = function () {
        console.log(reader.error);
    };
}

