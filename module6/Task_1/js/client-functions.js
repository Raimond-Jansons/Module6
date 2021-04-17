import {getRandomInt, Graph} from "./Algorithm.js"

export let SS //small side - width of line in maze
export let BS //big side - length of line in maze
export let tableSize
export let speed

let START, startSide
let FINISH, finishSide
let g

export let inputSize = document.getElementById('input-size')
export let inputApply = document.getElementById('input-apply')
const infoBlock = document.getElementById('info-box')
const launchBTN = document.querySelector('#launch-btn')

const canvas = document.createElement('canvas')
let context = canvas.getContext("2d")

export const bgc = "#313431"
export const mazeColor = "white"

export let isSearching = false

export let mainBlock; 

export const toddler = document.getElementById('speed-toddler')
toddler.value = 60
export const toddlerValue = document.getElementById('toddler-value')

export function toddlerListener() {
    toddlerValue.innerHTML = toddler.value
}

function checkInputCorrectness() {
    if (isNaN(tableSize) || tableSize <= 0) {
        infoBlock.style.color = "red"
        infoBlock.innerHTML = "ERROR"
        return false
    }
    if (tableSize === 1 || tableSize > 120) {
        infoBlock.style.color = "red"
        infoBlock.innerHTML = "Correct range: [2, 120]"
        return false
    }
    infoBlock.style.color = "white"
    infoBlock.innerHTML = "length = ???"
    return true
}

function setMazeElementsSize() {
    SS = 8;  
    BS = 30;  
    //responsiveness:
    while (BS * tableSize + SS + 2*40 > document.documentElement.clientWidth) {
        BS -= 3;
        SS -= 1;
    }
}

function mainBlockRendering() {
    mainBlock = document.createElement('div')
    mainBlock.className = "main-block"
    mainBlock.style.width = BS * tableSize + SS + 2*40 + "px";
    mainBlock.style.height = BS * tableSize + SS + 2*40 + "px";
        //40px is a canvas' margin
    document.body.append(mainBlock)
}

function canvasRendering() {
    canvas.width = BS * tableSize + SS
    canvas.height = BS * tableSize + SS
    canvas.style.margin = "40px"
    //borders rendering
    context.fillStyle = mazeColor
    context.fillRect(0, 0, BS * tableSize, SS)
    context.fillRect(0, tableSize * BS, BS * tableSize, SS)
    context.fillRect(0, 0, SS, BS * tableSize)
    context.fillRect(BS * tableSize, 0, SS, BS * tableSize)
    context.fillRect(BS * tableSize, BS * tableSize, SS, SS)
    mainBlock.append(canvas)
}

function wallsRendering() {
    for (let i = 0; i < tableSize * tableSize; i++) {
        if (i % tableSize == tableSize - 1) continue
        if (!g.matrix[i][i + 1]) {
            context.fillStyle = mazeColor
            context.fillRect((i % tableSize) * BS + BS, Math.floor(i / tableSize) * BS, SS, BS + SS)
        }
    }
    for (let i = 0; i < tableSize * tableSize - tableSize; i++) {
        if (!g.matrix[i][i + tableSize]) {
            context.fillStyle = mazeColor
            context.fillRect((i % tableSize) * BS, Math.floor(i / tableSize) * BS + BS, BS + SS, SS)
        }
    }
}

function getDefaultStart() {
    let x, y
    const randInt = getRandomInt(1, 4)
    const randCoord = getRandomInt(0, tableSize - 1)
    const S = document.createElement('span')
    S.id = "markS"
    S.innerHTML = "S"
    S.style.fontSize = "30px"
    S.style.position = "absolute"
    S.style.color = mazeColor
    if (randInt === 1) {
        x = randCoord
        y = 0
        context.fillStyle = bgc
        context.fillRect(x * BS + SS, 0, BS - SS, SS)
        S.style.top = -(30) + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) - 10 + "px"
        S.style.left = SS + x * BS + BS/7 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
        mainBlock.append(S)
        START = randCoord
        startSide = 1
    }
    else if (randInt === 2) {
        x = tableSize - 1
        y = randCoord
        context.fillStyle = bgc
        context.fillRect(BS * tableSize, y * BS + SS, SS, BS - SS)
        S.style.left = tableSize * BS + SS + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + 10 + "px"
        S.style.top = y * BS + SS / 2 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
        mainBlock.append(S)
        START = y * tableSize + x;
        startSide = 2
    }
    else if (randInt === 3) {
        x = randCoord
        y = tableSize - 1
        context.fillStyle = bgc
        context.fillRect(x * BS + SS, BS * tableSize, BS - SS, SS)
        S.style.top = tableSize * BS + SS + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + 10 + "px"
        S.style.left = x * BS + SS * 1.5 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
        mainBlock.append(S)
        START = tableSize * tableSize - tableSize + x;
        startSide = 3
    }
    else {
        x = 0
        y = randCoord
        context.fillStyle = bgc
        context.fillRect(0, y * BS + SS, SS, BS - SS)
        S.style.top = y * BS + SS/2 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
        S.style.left = -30 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
        mainBlock.append(S)
        START = tableSize * y
        startSide = 4
    }
    return [START, startSide]
}

function getDefaultFinish() {
    let x, y
    const randInt = getRandomInt(1, 4)
    const randCoord = getRandomInt(0, tableSize - 1)
    const F = document.createElement('span')
    F.id = "markF"
    F.innerHTML = "F"
    F.style.fontSize = "30px"
    F.style.position = "absolute"   
    F.style.color = mazeColor    
    if (randInt === 1) {
        x = randCoord
        y = 0
        FINISH = randCoord
        finishSide = 1
        if (FINISH == START) {
            if (START == tableSize - 1) {FINISH--; x--;}
            else {FINISH++; x++}
        }
        context.fillStyle = bgc
        context.fillRect(x * BS + SS, 0, BS - SS, SS)
        F.style.top = -(40) + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
        F.style.left = SS + x * BS + BS/7 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
        mainBlock.append(F)
    }
    else if (randInt === 2) {
        x = tableSize - 1
        y = randCoord
        FINISH = y * tableSize + x;
        finishSide = 2
        if (FINISH == START) {
            if (START == tableSize * tableSize - 1) {FINISH -= tableSize; y--;}
            else {FINISH += tableSize; y++}
        }
        context.fillStyle = bgc
        context.fillRect(BS * tableSize, y * BS + SS, SS, BS - SS)
        F.style.left = tableSize * BS + SS + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + 10 + "px"
        F.style.top = y * BS + SS / 2 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
        mainBlock.append(F)
    }
    else if (randInt === 3) {
        x = randCoord
        y = tableSize - 1
        FINISH = tableSize * tableSize - tableSize + x;
        finishSide = 3
        if (FINISH == START) {
            if (START == tableSize * tableSize - 1) {FINISH--; x--;}
            else {FINISH++; x++;}
        }
        context.fillStyle = bgc
        context.fillRect(x * BS + SS, BS * tableSize, BS - SS, SS)
        F.style.top = tableSize * BS + SS + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + 10 + "px"
        F.style.left = x * BS + SS * 1.5 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
        mainBlock.append(F)
    }
    else {
        x = 0
        y = randCoord
        FINISH = tableSize * y
        finishSide = 4
        if (FINISH == START) {
            if (START == tableSize * tableSize - tableSize) {FINISH -= tableSize; y--;}
            else {FINISH += tableSize; y++;}
        } 
        context.fillStyle = bgc
        context.fillRect(0, y * BS + SS, SS, BS - SS)
        F.style.top = y * BS + SS/2 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
        F.style.left = -30 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
        mainBlock.append(F)
    }
    return [FINISH, finishSide]
}

function deleteOldHole(holePos, holeSide) {
    context.fillStyle = mazeColor
    if (holeSide === 1) {
        context.fillRect(holePos * BS + SS, 0, BS - SS, SS)
    }
    else if (holeSide === 2) {
        context.fillRect(tableSize * BS, SS + Math.floor(holePos/tableSize) * BS, SS, BS - SS)
    }
    else if (holeSide === 3) {
        context.fillRect((holePos % tableSize) * BS + SS, tableSize * BS, BS - SS, SS)
    }
    else {
        context.fillRect(0, (holePos / tableSize) * BS + SS, SS, BS - SS)
    }
}

function canvasClickListener(event) {
    if (isSearching) return;
    const curX = Math.floor(event.offsetY / BS)
    const curY = Math.floor(event.offsetX / BS)
    let clickedPos
    let dialog = mainBlock.querySelector("#dialog") //must be let 'cause can be resigned in the future
    const S = document.getElementById("markS")
    const F = document.getElementById("markF")
    
    // adding/deleting vertical walls
    if (event.offsetX % BS >= 0 && event.offsetX % BS <= SS
    && curY != 0 && curY != tableSize && event.offsetY % BS > SS) {
        if (!g.matrix[curX * tableSize + curY - 1][curX * tableSize + curY]) {
            context.fillStyle = bgc
            context.fillRect(BS * curY, BS * curX + SS, SS, BS - SS)
            g.matrix[curX * tableSize + curY - 1][curX * tableSize + curY] = true
            g.matrix[curX * tableSize + curY][curX * tableSize + curY - 1] = true
        }
        else {
            context.fillStyle = mazeColor
            context.fillRect(BS * curY, BS * curX + SS, SS, BS - SS)
            g.matrix[curX * tableSize + curY - 1][curX * tableSize + curY] = false
            g.matrix[curX * tableSize + curY][curX * tableSize + curY - 1] = false
        }
    }
    // adding/deleting horizontal walls
    else if (event.offsetY % BS >= 0 && event.offsetY % BS <= SS
    && curX != 0 && curX != tableSize && event.offsetX % BS > SS) {
        if (!g.matrix[tableSize * (curX - 1) + curY][tableSize * (curX - 1) + curY + tableSize]) {
            context.fillStyle = bgc
            context.fillRect(BS * curY + SS, BS * curX, BS - SS, SS)
            g.matrix[tableSize * (curX - 1) + curY][tableSize * (curX - 1) + curY + tableSize] = true
            g.matrix[tableSize * (curX - 1) + curY + tableSize][tableSize * (curX - 1) + curY] = true
        }
        else {
            context.fillStyle = mazeColor
            context.fillRect(BS * curY + SS, BS * curX, BS - SS, SS)
            g.matrix[tableSize * (curX - 1) + curY][tableSize * (curX - 1) + curY + tableSize] = false
            g.matrix[tableSize * (curX - 1) + curY + tableSize][tableSize * (curX - 1) + curY] = false
        }
    }
    //changing start and finish
    else if (event.offsetX > SS && event.offsetX < tableSize * BS && event.offsetY <= SS) {
        clickedPos = curY
        if ((clickedPos == START && startSide == 1) || (clickedPos == FINISH && finishSide == 1)) {
            [START, FINISH] = [FINISH, START];
            [startSide, finishSide] = [finishSide, startSide];
            [S.style.top, F.style.top] = [F.style.top, S.style.top];
            [S.style.left, F.style.left] = [F.style.left, S.style.left];
        }
        else {
            if (dialog != undefined) dialog.remove()
            mainBlock.insertAdjacentHTML("afterbegin", '<div id="dialog"><button class="btn-s">S</button><span>or</span><button class="btn-f">F</button></div>')
            dialog = mainBlock.querySelector("#dialog")
            dialog.style.left = -dialog.offsetWidth / 2 + mainBlock.offsetWidth / 2 + "px";
            dialog.style.top = -dialog.offsetHeight / 2 + mainBlock.offsetHeight / 2 + "px";
            const S_btn = dialog.querySelector(".btn-s")
            const F_btn = dialog.querySelector(".btn-f")
            const letterPosTop = -(40) + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
            const letterPosLeft = SS + curY * BS + BS/7 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
            S_btn.onclick = function() {
                deleteOldHole(START, startSide)
                S.style.top = letterPosTop
                S.style.left = letterPosLeft
                START = clickedPos;
                startSide = 1
                context.fillStyle = bgc
                context.fillRect(START * BS + SS, 0, BS - SS, SS)
                dialog.remove()
            }
            F_btn.onclick = function() {
                deleteOldHole(FINISH, finishSide)
                F.style.top = letterPosTop
                F.style.left = letterPosLeft
                FINISH = clickedPos;
                finishSide = 1
                context.fillStyle = bgc
                context.fillRect(FINISH * BS + SS, 0, BS - SS, SS)
                dialog.remove()
            }
        }
    }
    else if (event.offsetX > tableSize * BS && event.offsetY > SS && event.offsetY <= tableSize * BS) {
        clickedPos = curX * tableSize + curY - 1;
        if ((clickedPos == START && startSide == 2) || (clickedPos == FINISH && finishSide == 2)) {
            [START, FINISH] = [FINISH, START];
            [startSide, finishSide] = [finishSide, startSide];
            [S.style.top, F.style.top] = [F.style.top, S.style.top];
            [S.style.left, F.style.left] = [F.style.left, S.style.left];
        }
        else {
            if (dialog != undefined) dialog.remove()
            mainBlock.insertAdjacentHTML("afterbegin", '<div id="dialog"><button class="btn-s">S</button><span>or</span><button class="btn-f">F</button></div>')
            dialog = mainBlock.querySelector("#dialog")
            dialog.style.left = -dialog.offsetWidth / 2 + mainBlock.offsetWidth / 2 + "px";
            dialog.style.top = -dialog.offsetHeight / 2 + mainBlock.offsetHeight / 2 + "px";
            const S_btn = dialog.querySelector(".btn-s")
            const F_btn = dialog.querySelector(".btn-f")
            const letterPosTop = curX * BS + SS / 2 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
            const letterPosLeft = tableSize * BS + SS + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + 10 + "px"
            S_btn.onclick = function() {
                deleteOldHole(START, startSide)
                S.style.top = letterPosTop
                S.style.left = letterPosLeft
                START = clickedPos;
                startSide = 2
                context.fillStyle = bgc
                context.fillRect(BS * tableSize, Math.floor(START / tableSize) * BS + SS, SS, BS - SS)
                dialog.remove()
            }
            F_btn.onclick = function() {
                deleteOldHole(FINISH, finishSide)
                F.style.top = letterPosTop
                F.style.left = letterPosLeft
                FINISH = clickedPos;
                finishSide = 2
                context.fillStyle = bgc
                context.fillRect(BS * tableSize, Math.floor(FINISH / tableSize) * BS + SS, SS, BS - SS)
                dialog.remove()
            }
        }
    }
    else if (event.offsetX > SS && event.offsetX < tableSize * BS && event.offsetY >= tableSize * BS) {
        clickedPos = (curX - 1) * tableSize + curY;
        if ((clickedPos == START && startSide == 3) || (clickedPos == FINISH && finishSide == 3)) {
            [START, FINISH] = [FINISH, START];
            [startSide, finishSide] = [finishSide, startSide];
            [S.style.top, F.style.top] = [F.style.top, S.style.top];
            [S.style.left, F.style.left] = [F.style.left, S.style.left];
        }
        else {
            if (dialog != undefined) dialog.remove()
            mainBlock.insertAdjacentHTML("afterbegin", '<div id="dialog"><button class="btn-s">S</button><span>or</span><button class="btn-f">F</button></div>')
            dialog = mainBlock.querySelector("#dialog")
            dialog.style.left = -dialog.offsetWidth / 2 + mainBlock.offsetWidth / 2 + "px";
            dialog.style.top = -dialog.offsetHeight / 2 + mainBlock.offsetHeight / 2 + "px";
            const S_btn = dialog.querySelector(".btn-s")
            const F_btn = dialog.querySelector(".btn-f")
            const letterPosTop = tableSize * BS + SS + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + 10 + "px"
            const letterPosLeft = (clickedPos % tableSize) * BS + SS * 1.5 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
            S_btn.onclick = function() {
                deleteOldHole(START, startSide)
                S.style.top = letterPosTop
                S.style.left = letterPosLeft
                START = clickedPos;
                startSide = 3
                context.fillStyle = bgc
                context.fillRect((clickedPos % tableSize) * BS + SS, BS * tableSize, BS - SS, SS)
                dialog.remove()
            }
            F_btn.onclick = function() {
                deleteOldHole(FINISH, finishSide)
                F.style.top = letterPosTop
                F.style.left = letterPosLeft
                FINISH = clickedPos;
                finishSide = 3
                context.fillStyle = bgc
                context.fillRect((clickedPos % tableSize) * BS + SS, BS * tableSize, BS - SS, SS)
                dialog.remove()
            }
        }
    }
    else if (event.offsetX <= SS && event.offsetY > SS && event.offsetY <= tableSize * BS) {
        clickedPos = curX * tableSize + curY;
        if ((clickedPos == START && startSide == 4) || (clickedPos == FINISH && finishSide == 4)) {
            [START, FINISH] = [FINISH, START];
            [startSide, finishSide] = [finishSide, startSide];
            [S.style.top, F.style.top] = [F.style.top, S.style.top];
            [S.style.left, F.style.left] = [F.style.left, S.style.left];
        }
        else {
            if (dialog != undefined) dialog.remove()
            mainBlock.insertAdjacentHTML("afterbegin", '<div id="dialog"><button class="btn-s">S</button><span>or</span><button class="btn-f">F</button></div>')
            dialog = mainBlock.querySelector("#dialog")
            dialog.style.left = -dialog.offsetWidth / 2 + mainBlock.offsetWidth / 2 + "px";
            dialog.style.top = -dialog.offsetHeight / 2 + mainBlock.offsetHeight / 2 + "px";
            const S_btn = dialog.querySelector(".btn-s")
            const F_btn = dialog.querySelector(".btn-f")
            const letterPosTop = curX * BS + SS/2 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
            const letterPosLeft = -30 + +canvas.style.margin.slice(0, canvas.style.margin.length - 2) + "px"
            S_btn.onclick = function() {
                deleteOldHole(START, startSide)
                S.style.top = letterPosTop
                S.style.left = letterPosLeft
                START = clickedPos;
                startSide = 4
                context.fillStyle = bgc
                context.fillRect(0, curX * BS + SS, SS, BS - SS)
                dialog.remove()
            }
            F_btn.onclick = function() {
                deleteOldHole(FINISH, finishSide)
                F.style.top = letterPosTop
                F.style.left = letterPosLeft
                FINISH = clickedPos;
                finishSide = 4
                context.fillStyle = bgc
                context.fillRect(0, curX * BS + SS, SS, BS - SS)
                dialog.remove()
            }
        }
    }
}

function launchBTNListener() {
    if (isSearching) return;
    infoBlock.style.color = "white"
    infoBlock.innerHTML = "length = ???"
    isSearching = true
    speed = +toddler.value
    g.Astar(START, FINISH, speed).then(function(result) {
        if (result === -1) {
            infoBlock.style.color = "red"
            infoBlock.innerHTML = "no path"
            isSearching = false
        }
        else {
            infoBlock.style.color = "white"
            infoBlock.innerHTML = "length = " + result
            isSearching = false
        }
    })
}

function canvasMousemoveListener(event) {
    if (isSearching) return;
    const curX = Math.floor(event.offsetY / BS)
    const curY = Math.floor(event.offsetX / BS)
    if (event.offsetX % BS >= 0 && event.offsetX % BS <= SS
    && curY != 0 && curY != tableSize && event.offsetY % BS > SS) {
        if (!g.matrix[curX * tableSize + curY - 1][curX * tableSize + curY]) {
            context.fillStyle = bgc
            context.fillRect(BS * curY, BS * curX + SS, SS, BS - SS)
            g.matrix[curX * tableSize + curY - 1][curX * tableSize + curY] = true
            g.matrix[curX * tableSize + curY][curX * tableSize + curY - 1] = true
        }
    }
    else if (event.offsetY % BS >= 0 && event.offsetY % BS <= SS
    && curX != 0 && curX != tableSize && event.offsetX % BS > SS) {
        if (!g.matrix[tableSize * (curX - 1) + curY][tableSize * (curX - 1) + curY + tableSize]) {
            context.fillStyle = bgc
            context.fillRect(BS * curY + SS, BS * curX, BS - SS, SS)
            g.matrix[tableSize * (curX - 1) + curY][tableSize * (curX - 1) + curY + tableSize] = true
            g.matrix[tableSize * (curX - 1) + curY + tableSize][tableSize * (curX - 1) + curY] = true
        }
    }
}

function keyDownListener(event) {
    if (isSearching) return;
    if (event.code == "ControlLeft") {
        canvas.addEventListener("mousemove", canvasMousemoveListener)
    }
}
function keyUpListener(event) {
    if (isSearching) return;
    if (event.code == "ControlLeft") {
        canvas.removeEventListener("mousemove", canvasMousemoveListener)
    }
}

export function inputApplyListener() {
    if (isSearching) return
    if (mainBlock != undefined) {
        mainBlock.remove()
    }

    tableSize = +inputSize.value
    const status = checkInputCorrectness()
    if (!status) return

    setMazeElementsSize()
    mainBlockRendering()
    canvasRendering()

    //maze generation
    g = new Graph(tableSize, context, BS, SS, bgc)
    g.mazeGenerate()

    wallsRendering()

    let arr = getDefaultStart()
    START = arr[0]
    startSide = arr[1]
    arr = getDefaultFinish(START)
    FINISH = arr[0]
    finishSide = arr[1]

    // adding/deleting walls by clicking + changing start/finish 
    canvas.addEventListener("click", canvasClickListener)

    document.addEventListener("keydown", keyDownListener)
    document.addEventListener("keyup", keyUpListener)

    launchBTN.addEventListener("click", launchBTNListener)
}