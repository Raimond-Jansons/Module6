import NN from './nn.js';
import trained_nn from './num5x5_nn.js'

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
        this.reset();
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
        // x = (x - cnv.offsetLeft);
        // y = (y - cnv.offsetTop);
        // x = (x - cnv.offsetLeft) / CELL_SIZE;
        // y = (y - cnv.offsetTop) / CELL_SIZE;
        // x = Math.max(0, Math.min(PIC_SIZE - 1, x));
        // y = Math.max(0, Math.min(PIC_SIZE - 1, y));
        // return [Math.floor(x), Math.floor(y)];
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
}




// let pic = [[]];



function redraw() {
    drawGrid();
    for (let i = 0; i < PIC_SIZE; i++) {
        for (let j = 0; j < PIC_SIZE; j++) {
            if (pic[i][j] > 0) {
                const color = (1 - pic[i][j]) * 255;
                ctx.fillStyle = `rgb(
                    ${color},
                    ${color},
                    ${color})`;
                ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}


//let paintColor = 1;


const CANVAS_SIZE = 500;
const PIC_SIZE = 50;
const CELL_SIZE = CANVAS_SIZE / PIC_SIZE;
const BRUSH_SIZE = 1.5;

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
    const pic = canvas.getPixels();
    if ((new Matrix(pic)).getSum() > 10) {
        const predicted = NN.ind_of_max(nn.predict(pic));
        console.log(predicted);
        answerSpan.textContent = 'Ответ: ' + predicted;
    } else {
        answerSpan.textContent = 'Ответ: убил';
    }

}
// cnv.onmouseout = endPaint;

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


const nn = new NN([2500, 500, 10]);
// nn.readFromFile(trained_nn);

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

function test_on_ds() {
    return nn.test(examples, 1);
}

window.test_on_ds = test_on_ds;



document.getElementById('saveBtn').onclick = () => {
    nn.saveToFile();
};


const dropbox = document.getElementById("dropbox");
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    const dt = e.dataTransfer;
    const files = dt.files;

    let reader = new FileReader();
    reader.readAsText(files[0]);
    reader.onload = function () {
        nn.readFromFile(reader.result);
    };

    reader.onerror = function () {
        console.log(reader.error);
    };
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.showExamples = async () => {
    for (const { input, output } of testSet) {
        pic = Matrix.reshapeFrom(input, PIC_SIZE, PIC_SIZE).data;
        redraw();
        console.log(`%c${NN.ind_of_max(output)}`, "font-size:50px");
        await sleep(1000);
    }
};
