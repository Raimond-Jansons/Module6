import {Vertex, antAlg} from './Algorithm.js'
const mainBlock = document.getElementById('main-block')
export const canvas = document.getElementById('main-canvas')
export const lineCanvas = document.getElementById('line-canvas')
export const antCanvas = document.getElementById('ant-canvas')
export const resultCanvas = document.getElementById('result-canvas')
export const launchBtn = document.getElementById('launch-btn')
export const clearBtn = document.getElementById('clear-btn')
const context = canvas.getContext('2d')
const lineContext = lineCanvas.getContext('2d')
const antContext = antCanvas.getContext('2d')
const resultContext = resultCanvas.getContext('2d')
const vertexRadius = 20
export const delay = 3
const antColor = "blue"
const bgColor = "#313431"
const mainColor = "white"
const lineColor = "#ACADAF"
const resultColor = "red"

let alg

export function canvasInit() {
    canvas.width = mainBlock.clientWidth
    canvas.height = mainBlock.clientHeight
    lineCanvas.width = canvas.width
    lineCanvas.height = canvas.height
    antCanvas.width = canvas.width
    antCanvas.height = canvas.height
    resultCanvas.width = canvas.width
    resultCanvas.height = canvas.height
}

let verteces = []
export function canvasListener(event) {
    const x = event.offsetX
    const y = event.offsetY
    if (canIDraw(x, y, vertexRadius)) {
        drawVertex(x, y)
        verteces.push(new Vertex(x, y))
        connectVerteces()
    }  
}

export function drawVertex(x, y) {
    context.fillStyle = mainColor
    context.beginPath()
    context.moveTo(x, y)
    context.closePath()
    context.arc(x, y, vertexRadius, 0, Math.PI * 2, false)
    context.fill()
}

export function canIDraw(x, y, r) {
    for (let i = 0; i < verteces.length; i++) {
        if (Math.abs(verteces[i].x - x) < 4 * r && Math.abs(verteces[i].y - y) < 4 * r) return false
    }
    return true
}

export function connectVerteces() {
    if (verteces.length === 0) return
    else {
        for (let i = 0; i < verteces.length - 1; i++) {   
            connectTwoVerteces(lineContext, i, verteces.length - 1, lineColor)
        }
    }
}

function connectTwoVerteces(context, i, j, color) {
    context.strokeStyle = color
    context.lineWidth = 3
    context.moveTo(verteces[i].x, verteces[i].y)
    context.lineTo(verteces[j].x, verteces[j].y)
    context.stroke()
}

export function getStepsQuantity(i, j) {
    const xDiff = verteces[i].x - verteces[j].x
    const yDiff = verteces[i].y - verteces[j].y
    return Math.abs(xDiff) > Math.abs(yDiff) ? Math.abs(Math.ceil(xDiff / 30)) : Math.abs(Math.ceil(yDiff / 30))
}

export function antMoving(i, j) {
    const xDiff = verteces[i].x - verteces[j].x
    const yDiff = verteces[i].y - verteces[j].y
    const stepsQuantity = Math.abs(xDiff) > Math.abs(yDiff) ? Math.abs(Math.ceil(xDiff / 30)) : Math.abs(Math.ceil(yDiff / 30)) 
    const xStepLen = Number((xDiff / stepsQuantity).toFixed(1))
    const yStepLen = Number((yDiff / stepsQuantity).toFixed(1))

    for (let k = 0; k <= stepsQuantity; k++) {
        (function(){
            setTimeout(() => { 
                if (k !== 0) {
                    antContext.beginPath()
                    antContext.moveTo(verteces[i].x, verteces[i].y)
                    antContext.closePath()
                    antContext.fillStyle = bgColor
                    antContext.arc(verteces[i].x - (k - 1) * xStepLen, verteces[i].y - (k - 1) * yStepLen, 11, 0, Math.PI * 2, false)
                    antContext.fill() 
                }
                antContext.beginPath()
                antContext.moveTo(verteces[i].x, verteces[i].y)
                antContext.closePath()
                antContext.fillStyle = antColor
                antContext.arc(verteces[i].x - k * xStepLen, verteces[i].y - k * yStepLen, 10, 0, Math.PI * 2, false)
                antContext.fill()
            }, k * delay)
        })();
    }
    return stepsQuantity
}

export function drawPath(arr) {
    let delaySum = 0
    for (let i = 0; i < arr.length - 1; i++) {
        setTimeout(() => { 
            delaySum += antMoving(arr[i], arr[i + 1])
        }, delaySum * delay)
    }
    delaySum += getStepsQuantity(arr[arr.length - 2], arr[arr.length - 1])
    return delaySum
}

export function drawResult(resultPath) {
    console.log(resultPath)
    resultCanvas.style.zIndex = 10
    for (let i = 0; i < resultPath.length - 1; i++) {
        connectTwoVerteces(resultContext, resultPath[i], resultPath[i + 1], resultColor)
    }
}

export function algorithmLaunching() {
    antContext.clearRect(0, 0, antCanvas.width, antCanvas.height)
    resultContext.clearRect(0, 0, resultCanvas.width, resultCanvas.height)
    antCanvas.width = antCanvas.width
    resultCanvas.width = resultCanvas.width
    alg = new antAlg(verteces)
    alg.launch()
}

export function clearBtnListener() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    lineContext.clearRect(0, 0, lineCanvas.width, lineCanvas.height)
    antContext.clearRect(0, 0, antCanvas.width, antCanvas.height)
    resultContext.clearRect(0, 0, resultCanvas.width, resultCanvas.height)
    canvas.width = canvas.width
    lineCanvas.width = lineCanvas.width
    antCanvas.width = antCanvas.width
    resultCanvas.width = resultCanvas.width
    resultCanvas.style.zIndex = 0
    verteces = []
}