import Canvas from './canvas.js';
import GA from './genetic.js';

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const cnvContainer = document.querySelector('.paint');
const cnvCities = document.getElementById('canvasCities');
const cnvRoute = document.getElementById('canvasRoute');

const BRUSH_SIZE = 20;
const canvas = new Canvas([cnvCities, cnvRoute], cnvContainer, BRUSH_SIZE);

let isInit = false;
let isRun = false;

function reset() {
    isInit = false;
    isRun = false;
    runBtnSpan.textContent = "Старт";
}

cnvCities.onclick = (e) => {
    e.preventDefault();
    const x = e.offsetX;
    const y = e.offsetY;
    canvas.addCircle(0, x, y);

}

document.getElementById('clearBtn').onclick = () => {
    canvas.reset();
    reset();
}

document.getElementById('loadBtn').onclick = () => {
    canvas.reset();
    canvas.circles = JSON.parse(localStorage.getItem('cities'));
    canvas.redraw(0);
    reset();
    console.log('Loaded');
}

document.getElementById('saveBtn').onclick = () => {
    localStorage.setItem('cities', JSON.stringify(canvas.circles));
    console.log('Saved');
}


window.onresize = () => {
    console.log('res');
    canvas.resize();
}

const GENERATION_NUM = 10000;
const MUTATION_RATE = 0.04;
const CROSS_RATE = 1;
const NEAREST_USAGE_RATE = 20;
const runBtnSpan = document.querySelector('#runBtn>span');
const infoBlock = document.getElementById('info');


let algLoop;
let genAlg;

document.getElementById('runBtn').onclick = () => {

    if (!isInit) {
        // console.log(canvas.circles);
        genAlg = new GA(canvas, canvas.circles);
        genAlg.setOptions({
            popSize: canvas.circles.length * 20,
            mutationRate: MUTATION_RATE,
            crossRate: CROSS_RATE,
            nearestUsageRate: NEAREST_USAGE_RATE
        });
        genAlg.initGen();
        isInit = true;
        bestLen = Infinity;
        genСount = 0;
    }

    // console.time('ga');
    if (!isRun) {
        isRun = true;
        lastChanges = genСount;
        runBtnSpan.textContent = "Пауза";
        algLoop = setInterval(algRun, 0);
        // console.timeEnd('ga');
    } else {
        isRun = false;
    }
}

let bestLen = Infinity;
let genСount = 0;
let lastChanges = 0;

function algRun() {
    if (!isRun) {
        clearInterval(algLoop);
        runBtnSpan.textContent = "Старт";
        return;
    }

    let curBestLen = bestLen;
    while (true) {
        curBestLen = genAlg.nextGen();
        genСount++;
        if (curBestLen != bestLen) {
            lastChanges = genСount;
            break;
        }
        if ((genСount + 1) % 100 == 0) {
            genСount++;
            break;
        }
        if (genСount - lastChanges > 10000) {
            isRun = false;
        }
    }
    bestLen = curBestLen;
    genAlg.drawRoute(genAlg.curBestRoute);
    console.log(bestLen);

    infoBlock.textContent = `${genСount} поколение, ${bestLen}`;
}