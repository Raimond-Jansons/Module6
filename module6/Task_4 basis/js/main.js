import {canvas, antCanvas, launchBtn, clearBtn, canvasInit, canvasListener, clearBtnListener, algorithmLaunching} from './client-functions.js'

canvasInit()

canvas.addEventListener("click", canvasListener)

launchBtn.addEventListener("click", () => {
    canvas.removeEventListener("click", canvasListener)
    algorithmLaunching()
    canvas.addEventListener("click", canvasListener)
})

clearBtn.addEventListener("click", clearBtnListener)