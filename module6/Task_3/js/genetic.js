class City {
    x;
    y;
    nearestCities;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

}

export default class GA {
    cities;
    popSize;
    mutationRate;
    crossRate;
    nearestUsageRate;
    curPop;
    // curFitnesses;
    curBestRoute;
    curBestRouteLen;
    cnv;

    constructor(cnv, citiesCoord) {
        this.cnv = cnv;
        this.cities = citiesCoord.map(coord => new City(coord.x, coord.y));

        this.calcCitiesDist();
    }

    setOptions({ popSize, mutationRate, crossRate, nearestUsageRate }) {
        this.popSize = popSize;
        this.mutationRate = mutationRate;
        this.crossRate = crossRate;
        this.nearestUsageRate = nearestUsageRate;
    }

    drawRoute(route) {
        const lines = route.concat(route[0]).map(i => this.cities[i]);

        this.cnv.drawLines(1, lines);
        this.cnv.drawCircle(1, lines[0].x, lines[0].y, 15, 'red');
        this.cnv.drawCircle(1, lines[1].x, lines[1].y, 15, 'green');
    }

    initGen() {
        this.populationFitness(this.createInitialPopulation(false));
        console.log(this.curBestRouteLen);

        this.curPop = this.createInitialPopulation(true);
        this.populationFitness(this.curPop);
    }

    nextGen() {
        this.curPop = this.generation(this.curPop);
        return this.curBestRouteLen;
    }

    generation(population) {

        population = this.crossPopulation(population);
        population = this.mutatePopulation(population);
        const fitnesses = this.populationFitness(population);
        population = this.selection(population, fitnesses);

        return population;
    }

    static shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
    }

    calcCitiesDist() {
        for (let i = 0; i < this.cities.length; i++) {
            this.cities[i].nearestCities = [];
            for (let j = 0; j < this.cities.length; j++) {
                if (i != j) {
                    this.cities[i].nearestCities.push({ ind: j, dist: this.distance(i, j) });
                }
            }
            this.cities[i].nearestCities = this.cities[i].nearestCities.sort((a, b) => a.dist - b.dist).map(c => c.ind);
        }
    }

    distance(a, b) {
        const { x: x1, y: y1 } = this.cities[a];
        const { x: x2, y: y2 } = this.cities[b];
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    createInitialRoute(isRand) {
        if (isRand) {
            const route = this.cities.map((_, i) => i);
            GA.shuffle(route);
            return route;
        } else {
            const route = new Set();
            let last = GA.randInt(0, this.cities.length);
            route.add(last);
            while (route.size < this.cities.length) {
                const remaining = this.cities[last].nearestCities.filter(c => !route.has(c));
                last = remaining[GA.randInt(0, Math.ceil(remaining.length / this.nearestUsageRate))];
                route.add(last);
            }

            return [...route];
        }
    }

    createInitialPopulation(isRand) {
        const population = [];
        for (let i = 0; i < this.popSize; i++) {
            population.push(this.createInitialRoute(isRand));
        }
        return population;
    }

    routeLen(route) {
        let sum = 0;
        for (let i = 0; i < route.length - 1; i++) {
            sum += this.distance(route[i], route[i + 1]);
        }
        sum += this.distance(route[0], route[route.length - 1]);
        return sum;
    }

    populationFitness(population) {
        const fitnesses = [];
        let min = Infinity;
        let minRoute = null;
        for (const route of population) {
            const len = this.routeLen(route);
            if (len < min) {
                min = len;
                minRoute = route;
            }
            fitnesses.push(1 / len);

        }
        // console.log(max, maxRoute);
        this.curBestRoute = minRoute;
        this.curBestRouteLen = min;
        //this.drawRoute(minRoute);
        return fitnesses;
    }

    selection(population, fitnesses) {
        const wheel = new Array(population.length);
        wheel[0] = fitnesses[0];
        for (let i = 1; i < population.length; i++) {
            wheel[i] = wheel[i - 1] + fitnesses[i];
        }
        const sum = wheel[wheel.length - 1];
        const newPopulation = population.slice(0, 2);
        while (newPopulation.length < this.popSize) {
            const pick = Math.random() * sum;
            let p = 0;
            while (wheel[p] < pick) p++;
            newPopulation.push(population[p]);
        }
        return newPopulation;

    }

    static randInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    cross(par1, par2) {
        if (Math.random() > this.crossRate) {
            return [par1, par2];
        }

        const start = GA.randInt(0, par1.length);
        const end = GA.randInt(start, par1.length) + 1;
        const child1 = Array(par1.length);
        const child2 = Array(par1.length);
        const set1 = new Set();
        const set2 = new Set();
        for (let i = start; i < end; i++) {
            child1[i] = par2[i];
            child2[i] = par1[i];
            set1.add(child1[i]);
            set2.add(child2[i]);
        }
        let p1Iter = end % par1.length;
        let p2Iter = end % par1.length;
        let childIter = end % par1.length;
        for (let i = 0; i < par1.length - (end - start); i++) {
            while (set1.has(par1[p1Iter])) p1Iter = (p1Iter + 1) % par1.length;
            while (set2.has(par2[p2Iter])) p2Iter = (p2Iter + 1) % par1.length;
            child1[childIter] = par1[p1Iter];
            child2[childIter] = par2[p2Iter];
            childIter = (childIter + 1) % par1.length;
            p1Iter = (p1Iter + 1) % par1.length;
            p2Iter = (p2Iter + 1) % par1.length;
        }

        return [child1, child2];
    }

    crossPopulation(population) {
        const childs = [this.curBestRoute, this.createInitialRoute(false)];
        // for (let i = 0; i < population.length - 1; i++) {
        //     for (let j = i; j < population.length; j++) {
        //         childs.push(...this.cross(population[i], population[j]));
        //     }
        // }
        while (childs.length < this.popSize * 2) {
            const first = GA.randInt(0, population.length);
            const second = GA.randInt(0, population.length);
            childs.push(...this.cross(population[first], population[second]));
        }
        return childs;
    }

    mutate(route) {
        for (let i = 0; i < route.length; i++) {
            if (Math.random() < this.mutationRate) {
                const j = GA.randInt(0, route.length);
                [route[i], route[j]] = [route[j], route[i]];
            }
        }
        return route;
    }

    mutatePopulation(population) {
        for (let i = 1; i < population.length; i++) {
            population[i] = this.mutate(population[i]);
        }
        return population;
    }
}
