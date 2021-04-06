import NN from './nn.js';
import trained_nn from './num5x5_nn.js'

const linAlg = linearAlgebra(),
    Matrix = linAlg.Matrix;
// window.nn = nn;
// window.test_on_ds = test_on_ds;

const CANVAS_SIZE = 200;
const PIC_SIZE = 5;
const CELL_SIZE = CANVAS_SIZE / PIC_SIZE;
let cnv = document.getElementById('canvas');

cnv.width = CANVAS_SIZE;
cnv.height = CANVAS_SIZE;

/** @type {CanvasRenderingContext2D} */
let ctx = cnv.getContext('2d');
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

let pic = [[]];

reset();
function reset() {
    drawGrid();
    pic = Array(PIC_SIZE).fill().map(() => Array(PIC_SIZE).fill(false)); //matrix 5x5
}


function drawGrid() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < PIC_SIZE; i++) {
        ctx.moveTo(0, CELL_SIZE * i)
        ctx.lineTo(CANVAS_SIZE, CELL_SIZE * i);
        ctx.moveTo(CELL_SIZE * i, 0)
        ctx.lineTo(CELL_SIZE * i, CANVAS_SIZE);
    }
    ctx.stroke();
    ctx.closePath();
}

let k = canvas.getBoundingClientRect().width / cnv.width;
function calcCoord(x, y) {
    //return [(x - cnv.offsetLeft) / k, (y - cnv.offsetTop) / k];
    x = (x - cnv.offsetLeft) / CELL_SIZE;
    y = (y - cnv.offsetTop) / CELL_SIZE;
    x = Math.max(0, Math.min(PIC_SIZE - 1, x));
    y = Math.max(0, Math.min(PIC_SIZE - 1, y));
    return [Math.floor(x), Math.floor(y)];
}

function redraw() {
    drawGrid();
    for (let i = 0; i < PIC_SIZE; i++) {
        for (let j = 0; j < PIC_SIZE; j++) {
            if (pic[i][j]) {
                ctx.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// function startPaint(event) {
//     //console.log('start');
//     isPaint = true;
//     let [x, y] = calcCoord(event.pageX, event.pageY);
//     ctx.beginPath();
//     ctx.moveTo(x, y);
// }

// function movePaint(event) {
//     //console.log('move');
//     if (isPaint) {
//         let [x, y] = calcCoord(event.pageX, event.pageY);
//         ctx.lineTo(x, y);
//         ctx.stroke();
//         ctx.closePath();
//         ctx.beginPath();
//         ctx.moveTo(x, y);
//     }
// }

// function endPaint(event) {
//     //console.log('end');
//     if (isPaint) {
//         isPaint = false;
//         let [x, y] = calcCoord(event.pageX, event.pageY);
//         ctx.lineTo(x, y);
//         ctx.stroke();
//         ctx.closePath();
//     }
// }

const answerSpan = document.getElementById('answer');

let isPaint = false;
let paintColor = 1;

function startPaint(event) {
    //console.log('start');
    isPaint = true;
    let [x, y] = calcCoord(event.pageX, event.pageY);
    paintColor = !pic[x][y];
    pic[x][y] = paintColor;
    redraw();
}

function movePaint(event) {
    //console.log('move');
    if (isPaint) {
        let [x, y] = calcCoord(event.pageX, event.pageY);
        pic[x][y] = paintColor;
        redraw();
    }
}

function endPaint(event) {
    //console.log('end');
    if (isPaint) {
        isPaint = false;
        if ((new Matrix(pic)).getSum() > 2) {
            const predicted = NN.ind_of_max(nn.predict(pic.flat()));
            console.log(predicted);
            answerSpan.textContent = 'Ответ: ' + predicted;
        } else {
            answerSpan.textContent = 'Ответ: убил';
        }

    }
}

cnv.onmousedown = startPaint;

cnv.onmousemove = movePaint;

document.onmouseup = endPaint;
// cnv.onmouseout = endPaint;

document.getElementById('clearBtn').onclick = reset;

function intToVector(a) {
    const arr = Array(10).fill(0);
    arr[+a] = 1;
    return arr;
}

const examples = JSON.parse(localStorage.getItem('examples') ?? '[]');
const digitInput = document.getElementById('digit');
document.getElementById('addExampleBtn').onclick = () => {
    examples.push({ x: pic.flat().map(v => +v), y: intToVector(digitInput.value) })
    localStorage.setItem('examples', JSON.stringify(examples));
    reset();
};


const nn = new NN([25, 30, 10]);
nn.readFromFile(trained_nn);

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


// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// window.showExamples = async () => {
//     for (const { x, y } of examples) {
//         pic = Matrix.reshapeFrom(x, 5, 5).data;
//         redraw();
//         console.log(NN.ind_of_max(y));
//         await sleep(1000);
//     }
// };