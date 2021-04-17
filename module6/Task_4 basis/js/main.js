import {canvas, launchBtn, clearBtn, canvasInit, canvasListener, clearBtnListener, algorithmLaunching} from './client-functions.js'

canvasInit()

canvas.addEventListener("click", canvasListener)

launchBtn.addEventListener("click", () => {
    canvas.removeEventListener("click", canvasListener)
    clearBtn.removeEventListener("click", clearBtnListener)
    algorithmLaunching()
})

clearBtn.addEventListener("click", clearBtnListener)