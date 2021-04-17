var
    canvas = document.getElementById('canvas')
context = canvas.getContext('2d')
//buttonAlg = getElementById('addButton')

let Points = []
clusters = [] // Для K-means++
Kmedoids = []
index = 0
countOfClusters = 10
KMedoidscount = 5
numberOfCluster = 0
finished = false
x = 0
y = 0

const inputCount = document.getElementById("input-count")
const inputApply = document.getElementById("input-apply")
const launchBtn = document.getElementById("launch-btn")
inputApply.addEventListener("click", () => {
    countOfClusters = inputCount.value
    console.log(countOfClusters)

    clusters = []
    for (let i = 0; i < countOfClusters; i++) {
        clusters.push(new cluster(i, countOfClusters))
    }

    launchBtn.addEventListener("click", () => {
        clustering()
    })
})

class cluster {

    selectColor(colorNum, colors) {
        if (colors < 1) colors = 1; // defaults to one color - avoid divide by zero
        return "hsl(" + (colorNum * (360 / colors) % 360) + ",100%,50%)"
    }

    constructor(i, countOfClusters) {
        // this.color = '#' + Math.floor(Math.random() * 16777215).toString(16)
        this.color = this.selectColor(i, countOfClusters)
        this.centerX
        this.centerY
        this.Lngth = 0
        this.coordX = 0
        this.coordY = 0
    }
}



// for (let i = 0; i < KMedoidscount; i++) {
//     Kmedoids.push(new cluster(i, KMedoidscount))
// }

canvas.addEventListener('click', function (e) {
    context.fillStyle = 'black'
    context.fillRect(e.offsetX - 10, e.offsetY - 10, 10, 10)
    Points.push({ x: e.offsetX, y: e.offsetY })

    console.log(index)
    console.log(Points[index].x, Points[index].y)
    index++
    if (index === 50) {
        clustering()
        // index++
    }
})

//buttonAlg.addEventListener('click', clustering)

function clustering() { // основной алгоритм
    if (Points.length === 0 || countOfClusters === 0) {
        return
    }
    if (countOfClusters !== 0) {
        if (Points.length < countOfClusters) {
            for (let i = 0; i < Points.length; i++) {
                Points[i].cluster = i
            }
        } else {
            initCentroids()
            KMeans()
        }
    }

    if (KMedoidscount === 0) {
        if (Points.length < KMedoidscount) {
            for (let i = 0; i < Points.length; i++) {
                Points[i].clusterKMedoids = i
            }
        } else {
            KMedoids()
        }
    }



    // конец работы демонстрация результата

    for (let i = 0; i < Points.length; i++) { ////////////
        context.fillStyle = clusters[Points[i].cluster].color
        context.fillRect(Points[i].x - 10, Points[i].y - 10, 10, 10)
        console.log(Points[i])
    }


    // for (let i = 0; i < Points.length; i++) { ////////////
    //     context.fillStyle = Kmedoids[Points[i].cluster].color
    //     context.fillRect(Points[i].x, Points[i].y, 5, 5)
    //     console.log(Points[i])
    // }


}

function KMeans() {
    updateClusters()
    // пока меняется меняем
    while (!finished) {
        movecentroid()
        if (!finished) {
            updateClusters()
        }
    }
}

function KMedoids() {

    let potentialCluster = []
    for (let y = 0; y < KMedoidscount; y++) {
        Kmedoids[y].centerX = Points[y].x
        Kmedoids[y].centerY = Points[y].y
    }

    let sumX = 0, sumY = 0, nextsumX = 0, nextsumY = 0

    for (let d = 0; d < Points.length; d++) {
        for (let i = 0; i < Points.length; i++) {
            console.log('раз два три')
            let lowestdx = -1, numberCluster
            for (let j = 0; j < Kmedoids.length; i++) {
                let dx = Math.pow(Kmedoids[j].centerX - Points[i].x, 2) + Math.pow(Kmedoids[j].centerY - Points[i].y, 2)
                if (dx < lowestdx || lowestdx === -1) {
                    lowestdx = dx
                    numberCluster = j
                }
            }
            Kmedoids[numberCluster].coordX += Points[i].x
            Kmedoids[numberCluster].coordY += Points[i].y
            potentialCluster[i] = numberCluster

        }
        if (d === 0) {
            for (let z = 0; z < Kmedoids.length; z++) {
                sumX += Kmedoids[numberCluster].coordX
                sumY += Kmedoids[numberCluster].coordX
            }
            for (let i = 0; i < Points.length; i++) {
                Points[i].KMedoidscluster = potentialCluster[i]
            }

        } else {
            for (let z = 0; z < Kmedoids.length; z++) {
                nextsumX += Kmedoids[numberCluster].coordX
                nextsumY += Kmedoids[numberCluster].coordX
            }
            if (nexsumX + nextsumY < sumX + sumY) {
                sumX = nextsumX
                sumY = nextsumY
                for (let i = 0; i < Points.length; i++) {
                    Points[i].KMedoidscluster = potentialCluster[i]
                }
            }
        }
        for (let h = 0; h < Kmedoids.length; h++) {
            Kmedoids[numberCluster].coordX = 0
            Kmedoids[numberCluster].coordY = 0
        }
    }
}

function initCentroids() { //K-means++

    clusters[0].centerX = Points[0].x
    clusters[0].centerY = Points[0].y
    Points[0].used = true
    for (let i = 1; i < Points.length; i++) {
        Points[i].used = false
    }

    let min, maxdx, numberOfNextCentroid, potentialCentroid
    for (let i = 1; i < clusters.length; i++) {
        min = Infinity
        maxdx = -1
        numberOfNextCentroid = -1
        potentialCentroid = -1
        for (let j = 0; j < Points.length; j++) { //1
            if (Points[j].used === false) {
                for (let d = 0; d < i; d++) {
                    let dx = Math.pow(clusters[d].centerX - Points[j].x, 2) + Math.pow(clusters[d].centerY - Points[j].y, 2)
                    if (dx < min && dx !== 0) {
                        min = dx
                        potentialCentroid = j
                    }
                }

                if (min > maxdx && min !== Infinity) {
                    maxdx = min
                    numberOfNextCentroid = potentialCentroid
                }
                min = Infinity
            }
        }

        clusters[i].centerX = Points[numberOfNextCentroid].x
        clusters[i].centerY = Points[numberOfNextCentroid].y
        Points[numberOfNextCentroid].used = true

    }

    for (let i = 0; i < clusters.length; i++) {
        console.log(clusters[i].centerX, clusters[i].centerY)
    }
}


function updateClusters() { // После инициализации и каждого изменения центроидов проверяем, не поменись ли входящие в кластеры точки

    for (let i = 0; i < Points.length; i++) {
        let minDX = Infinity

        for (let j = 0; j < clusters.length; j++) {
            let d = Math.pow(clusters[j].centerX - Points[i].x, 2) + Math.pow(clusters[j].centerY - Points[i].y, 2)
            if (d < minDX) {
                minDX = d
                numberOfCluster = j
            }
        }

        console.log(numberOfCluster)
        clusters[numberOfCluster].coordX += Points[i].x
        clusters[numberOfCluster].coordY += Points[i].y
        clusters[numberOfCluster].Lngth++

        Points[i].cluster = numberOfCluster
    }
}

function movecentroid() { // сдвиг центроида
    finished = true
    for (let i = 0; i < clusters.length; i++) {
        if (clusters[i].Lngth !== 0) {
            x = clusters[i].coordX / clusters[i].Lngth
            y = clusters[i].coordY / clusters[i].Lngth
            if ((clusters[i].centerX > x + 5) || (clusters[i].centerX < x - 5) || (clusters[i].centerY > y + 5) || (clusters[i].centerY < y - 5)) {
                clusters[i].centerX = x
                clusters[i].centerY = y
                finished = false
                for (let j = 0; j < clusters.length; j++) {
                    clusters[j].coordX = 0
                    clusters[j].coordY = 0
                    clusters[j].Lngth = 0
                }
                return
            }
        }
    }
}



