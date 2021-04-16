import Canvas from './canvas.js';
import GA from './genetic.js';

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const cnvContainer = document.querySelector('.paint');
const cnvCities = document.getElementById('canvasCities');
const cnvRoute = document.getElementById('canvasRoute');

const BRUSH_SIZE = 20;
const canvas = new Canvas([cnvCities, cnvRoute], cnvContainer, BRUSH_SIZE);

cnvCities.onclick = (e) => {
    e.preventDefault();
    const x = e.offsetX;
    const y = e.offsetY;
    canvas.addCircle(0, x, y);
}

document.getElementById('clearBtn').onclick = () => {
    canvas.reset();
}

document.getElementById('loadBtn').onclick = () => {
    canvas.circles = JSON.parse(localStorage.getItem('cities'));
    canvas.redraw(0);
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
const MUTATION_RATE = 0.05;
const CROSS_RATE = 1;
const NEAREST_USAGE_RATE = 50;
const infoBlock = document.getElementById('info');
document.getElementById('startBtn').onclick = async () => {
    console.log(canvas.circles);
    const genAlg = new GA(canvas, canvas.circles, canvas.circles.length * 20, MUTATION_RATE, CROSS_RATE, NEAREST_USAGE_RATE);
    const gen_num = canvas.circles.length * canvas.circles.length * 50;
    console.time('ga');
    let bestLen = Infinity;
    for (let i = 0; i < gen_num; i++) {
        await sleep(1);
        let curBestLen = bestLen;
        while (curBestLen == bestLen && i < gen_num && i % 100 != 0) {
            curBestLen = genAlg.nextGen();
            i++;
        }
        bestLen = curBestLen;
        genAlg.drawRoute(genAlg.curBestRoute);
        console.log(bestLen);

        infoBlock.textContent = `${i} / ${gen_num}, ${bestLen}`;
    }
    console.timeEnd('ga');
}