'use strict'

const SS = 8;  //small side
const BS = 35;  //big side

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min; 
    //maximum and minimum are included
}

class Connection {
    firstV
    secondV
    constructor(v1, v2) {
        this.firstV = v1
        this.secondV = v2
    }
}

function addConnection(arr, curVer, tableSize) {
    if (curVer % tableSize != tableSize - 1 && curVer < tableSize * tableSize - 1) 
        arr.push(new Connection(curVer, curVer + 1))
    if (curVer < tableSize * tableSize - tableSize)
        arr.push(new Connection(curVer, curVer + +tableSize))
    if ((curVer - 1) % tableSize != tableSize - 1 && curVer > 0)
        arr.push(new Connection(curVer, curVer - 1))
    if (curVer >= tableSize)
        arr.push(new Connection(curVer, curVer - tableSize))
}

class Graph {
    matrix = []
    tableSize
    constructor(n) {
        this.tableSize = n
        for (let i = 0; i < n * n; i++) {
            this.matrix[i] = []
        }
        for (let i = 0; i < n * n; i++) {
            for (let j = 0; j < n * n; j++) {
                this.matrix[i][j] = false;
            }
        }
    }
    mazeGenerate() {
        let used = []
        let arrConnection = []
        let currentVertex = Math.floor(this.tableSize * this.tableSize / 2);
        used[currentVertex] = true;
        addConnection(arrConnection, currentVertex, this.tableSize)
        let randomIndex
        while (arrConnection.length != 0) { 
            randomIndex = getRandomInt(0, arrConnection.length - 1)
            if (!used[arrConnection[randomIndex].secondV]) {
                used[arrConnection[randomIndex].secondV] = true
                this.matrix[arrConnection[randomIndex].firstV][arrConnection[randomIndex].secondV] = true
                this.matrix[arrConnection[randomIndex].secondV][arrConnection[randomIndex].firstV] = true
                addConnection(arrConnection, arrConnection[randomIndex].secondV, this.tableSize)
                arrConnection.splice(randomIndex, 1)
            } else {
                arrConnection.splice(randomIndex, 1)
            }
        }
        // console.log(this.matrix)
    } 
}


let inputSize = document.getElementById('input-size')
let inputApply = document.getElementById('input-apply')

let mainBlock;


inputApply.addEventListener("click", ()=> {
    if (mainBlock != undefined) {
        mainBlock.remove()
    }
    const tableSize = +inputSize.value

    //maze generation
    let g = new Graph(tableSize)
    g.mazeGenerate()

    //main block rendering
    mainBlock = document.createElement('div')
    mainBlock.className = "main-block"
    mainBlock.style.width = BS * tableSize + "px";
    mainBlock.style.height = BS * tableSize + "px";
    document.body.append(mainBlock)

    //canvas rendering
    const canvas = document.createElement('canvas')
    let context = canvas.getContext("2d")
    canvas.width = BS * tableSize + SS
    canvas.height = BS * tableSize + SS
    canvas.style.transition = ".5s"
    for (let i = 0; i < tableSize + 1; i++) {
        context.fillStyle = "green"
        context.fillRect(0, i * BS, BS * tableSize, SS)

        context.fillStyle = "green"
        context.fillRect(i * BS, 0, SS, BS * tableSize)
    }
    context.fillStyle = "green"
    context.fillRect(BS * tableSize, BS * tableSize, SS, SS)

    mainBlock.append(canvas)


    //walls rendering according to adjacency table
    for (let i = 0; i < tableSize * tableSize; i++) {
        if (i % tableSize == tableSize - 1) continue
        if (g.matrix[i][i + 1]) {
            context.fillStyle = "white"
            context.fillRect((i % tableSize) * BS + BS, Math.floor(i / tableSize) * BS + SS, SS, BS - SS)
        }
    }
    for (let i = 0; i < tableSize * tableSize - tableSize; i++) {
        if (g.matrix[i][i + tableSize]) {
            context.fillStyle = "white"
            context.fillRect((i % tableSize) * BS + SS, Math.floor(i / tableSize) * BS + BS, BS - SS, SS)
        }
    }

    //adding and deleting walls by clicking
    let curY, curX;
    canvas.onclick = function(event) {
        curX = Math.floor(event.offsetY / BS)
        curY = Math.floor(event.offsetX / BS)
        //vertical walls
        if (event.offsetX % BS >= 0 && event.offsetX % BS <= SS
        && curY != 0 && curY != tableSize && event.offsetY % BS > SS) {
            if (!g.matrix[curX * tableSize + curY - 1][curX * tableSize + curY]) {
                context.fillStyle = "white"
                context.fillRect(BS * curY, BS * curX + SS, SS, BS - SS)
                g.matrix[curX * tableSize + curY - 1][curX * tableSize + curY] = true
            }
            else {
                context.fillStyle = "green"
                context.fillRect(BS * curY, BS * curX + SS, SS, BS - SS)
                g.matrix[curX * tableSize + curY - 1][curX * tableSize + curY] = false
            }
        }
        //horizontal walls
        if (event.offsetY % BS >= 0 && event.offsetY % BS <= SS
        && curX != 0 && curX != tableSize && event.offsetX % BS > SS) {
            if (!g.matrix[tableSize * (curX - 1) + curY][tableSize * (curX - 1) + curY + tableSize]) {
                context.fillStyle = "white"
                context.fillRect(BS * curY + SS, BS * curX, BS - SS, SS)
                g.matrix[tableSize * (curX - 1) + curY][tableSize * (curX - 1) + curY + tableSize] = true
            }
            else {
                context.fillStyle = "green"
                context.fillRect(BS * curY + SS, BS * curX, BS - SS, SS)
                g.matrix[tableSize * (curX - 1) + curY][tableSize * (curX - 1) + curY + tableSize] = false
            }
        }
    }
  
})