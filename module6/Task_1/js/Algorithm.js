function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min; 
    //maximum and minimum are included
}

class Connection {
    constructor(v1, v2) {
        this.firstV = v1
        this.secondV = v2
    }
}

class Vertex {
    constructor(n, f) {
        this.number = n
        this.F = f
    }
}

class PriorityQueue {
    constructor() {
        this.items = [];
    }
    enqueue(element) {
        if (this.items.length == 0) this.items.push(element)
        else {
            for (let i = 0; i < this.items.length; i++) {
                if (element.F > this.items[i].F) {
					this.items.splice(i, 0, element)
					return;
				}
            }
			this.items.push(element)
        }
    } 
    dequeue() {
        if (this.items.length != 0) {return this.items.pop()}
    }
    isEmpty() {
        if (this.items.length === 0) return true
        else return false
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
    constructor(n, context, bs, ss, bgc) {
        this.tableSize = n
        this.context = context
        this.BS = bs
        this.SS = ss
        this.bgc = bgc
        for (let i = 0; i < n * n; i++) {
            this.matrix[i] = []
        }
        for (let i = 0; i < n * n; i++) {
            for (let j = 0; j < n * n; j++) {
                this.matrix[i][j] = false;
            }
        }
    }
    paintOverCell(cell, color, context) {
        context.fillStyle = color
        context.fillRect((cell % this.tableSize) * this.BS + this.SS, 
            Math.floor(cell / this.tableSize) * this.BS + this.SS, this.BS - this.SS, this.BS - this.SS)
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
    } 
    getH(vertex, FINISH) {
        let firstDiff = Math.abs(vertex % this.tableSize - FINISH % this.tableSize) + 1
        firstDiff = firstDiff * firstDiff
        let secondDiff = Math.floor(vertex / this.tableSize) - Math.floor(FINISH / this.tableSize) + 1
        secondDiff = secondDiff * secondDiff
        return +Math.sqrt(firstDiff + secondDiff).toFixed(1)
    } 
    async Astar(START, FINISH, speed) {
        for (let i = 0; i < this.tableSize * this.tableSize; i++) this.paintOverCell(i, this.bgc, this.context)
        if (START === FINISH) {
            this.paintOverCell(START, "red", this.context)
            return;
        }
        let parent = []
        let G = []
        let state = []
        for (let i = 0; i < this.tableSize * this.tableSize; i++) {state[i] = 0}
        //state[i] === -1 only if vertex_i in closed list
        //state[i] === {some positive value} only if vertex_i in the opened list and...
        //...this positive value is F. By the way, F = G + H
        //Otherwise state[i] equals ZERO. It means vertex hasn't been checked yet
        let q = new PriorityQueue()
        let curVer = new Vertex(START, 0)
        G[curVer.number] = 0
        state[curVer.number] = 0
        parent[curVer.number] = -1
        q.enqueue(curVer)
        let end = false
        while (!q.isEmpty()) {
            curVer = q.dequeue()
            this.paintOverCell(curVer.number, "green", this.context)
            await this.sleep(speed)
            state[curVer.number] = -1
            for (let i = 0; i < this.tableSize * this.tableSize; i++) {
                if (this.matrix[curVer.number][i] && state[i] === 0) {
                    this.paintOverCell(i, "blue", this.context)
                    G[i] = G[curVer.number] + 1;
                    parent[i] = curVer.number
                    state[i] = G[i] + this.getH(i, FINISH)
                    q.enqueue(new Vertex(i, state[i]))
                    if (i === FINISH) {
                        end = true
                        break;
                    }
                }
                else if (this.matrix[curVer.number][i] && state[i] > 0) {
                    if (G[i] > G[curVer.number] + 1) {
                        G[i] = G[curVer.number] + 1
                        parent[i] = curVer.number
                        state[i] = G[i] + this.getH(i, FINISH)
                    }
                }
            }
            if (end) break;
            await this.sleep(speed)
        }
        //printing a result path
        if (end) {
            let length = 1
            let curNum = FINISH;
            while(curNum != START) {
                this.paintOverCell(curNum, "red", this.context)
                curNum = parent[curNum]
                length++
            }
            this.paintOverCell(START, "red", this.context)
            return length
        }
        else return -1
    }
}

export {getRandomInt, Graph};