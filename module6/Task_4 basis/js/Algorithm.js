import {drawPath, drawResult} from './client-functions.js'

export class Vertex {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

export class antAlg {
    constructor(verteces) {
        this.verteces = verteces
        this.matrix = []
        for (let i = 0; i < this.verteces.length; i++) {
            this.matrix[i] = []
        }
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = i; j < this.matrix.length; j++) {
                if (i === j) this.matrix[i][j] = -1
                else {
                    this.matrix[i][j] = (Math.sqrt((verteces[j].x - verteces[i].x) * (verteces[j].x - verteces[i].x) + 
                        (verteces[j].y - verteces[i].y) * (verteces[j].y - verteces[i].y))).toFixed(1)
                    this.matrix[i][j] = Number(this.matrix[i][j])
                    this.matrix[j][i] = this.matrix[i][j]
                }
            }
        }
        this.pheromone = []
        for (let i = 0; i < this.matrix.length; i++) {
            this.pheromone[i] = []
            for (let j = 0; j < this.matrix.length; j++) {
                this.pheromone[i][j] = 100
            }
        }
        this.alpha = 1
        this.beta = 1
        this.p = 0.08
        this.shortestPath = []
        this.shortestPathLen = 0
        for (let i = 0; i < this.matrix.length; i++) {
            this.shortestPath.push(i)
        }
        this.shortestPath.push(0)
        this.shortestPathLen = 0
        for (let i = 0; i < this.shortestPath.length - 1; i++) {
            this.shortestPathLen += this.matrix[this.shortestPath[i]][this.shortestPath[i + 1]]
        }
        this.sure = []
    }
    chooseNextOne(curPosition, availableGoals) {
        let sum = 0
        for (let i = 0; i < availableGoals.length; i++) {
            sum += (this.pheromone[curPosition][availableGoals[i]]**this.alpha) * 
            ((1 / this.matrix[curPosition][availableGoals[i]])**this.beta)
        }
        let probabilities = []
        for (let i = 0; i < availableGoals.length; i++) {
            //console.log(this.pheromone[curPosition][availableGoals[i]]**this.alpha)
            //console.log((1 / this.matrix[curPosition][availableGoals[i]])**this.beta)
            probabilities.push((this.pheromone[curPosition][availableGoals[i]]**this.alpha) * 
            ((1 / this.matrix[curPosition][availableGoals[i]])**this.beta) / sum)
        }
        if (probabilities.length === this.matrix.length - 1) {
            for (let i = 0; i < availableGoals.length; i++) {
                if (probabilities[i] > 0.9 && !this.sure.includes(i)) this.sure.push(i)
            }
            //console.log(this.sure)
        }
        //console.log(probabilities)
        let roulette = []
        for (let i = 0; i < probabilities.length; i++) roulette[i] = probabilities[i]
        for (let i = 0; i < probabilities.length - 1; i++) {
            for (let j = i + 1; j < probabilities.length; j++) {
                roulette[j] += probabilities[i]
            }
        }
        let rand = Math.random()
        for (let i = 0; i < roulette.length; i++) {
            if (rand < roulette[i]) return availableGoals[i]
        }
    }
    launch() {
        const verNum = this.verteces.length
        let curPath
        let curPathLen = 0
        let curPosition
        let availableGoals
        let counter = 0
        let sumOfDelays = 0
        while (true) {
            for (let j = 0; j < verNum; j++) {
                curPath = []
                curPathLen = 0
                curPosition = j
                availableGoals = []
                for (let k = 0; k < verNum; k++) if (k !== j) availableGoals.push(k)
                curPath.push(curPosition)
                while (availableGoals.length !== 0) {
                    curPosition = this.chooseNextOne(curPosition, availableGoals)
                    curPath.push(curPosition)
                    availableGoals.splice(availableGoals.indexOf(curPosition), 1)
                }
                curPath.push(j)
                if (j === 1) sumOfDelays += drawPath(curPath)
                else drawPath(curPath)
                for (let k = 0; k < curPath.length - 1; k++) {
                    curPathLen += this.matrix[curPath[k]][curPath[k + 1]]
                }
                if (curPathLen < this.shortestPathLen) {
                    this.shortestPathLen = curPathLen
                    this.shortestPath = curPath
                }
                for (let k = 0; k < verNum; k++) {
                    for (let m = 0; m < verNum; m++) {
                        if (k !== m) this.pheromone[k][m] *= (1 - this.p)
                    }
                }
                for (let k = 0; k < curPath.length - 1; k++) {
                    this.pheromone[curPath[k]][curPath[k + 1]] += (verNum * 4000 / curPathLen)
                }
                //console.log(this.pheromone)
            }
            if (this.sure.length >= verNum - 1) {
                counter++
            }
            if (counter === 500) {
                setTimeout(() => { 
                    drawResult(curPath)
                }, sumOfDelays / verNum)
                break
            }
        }
        console.log(sumOfDelays / verNum)
        
        console.log(this.pheromone)
        console.log(this.shortestPath)
        console.log(this.shortestPathLen)
        return this.shortestPath
    }
}