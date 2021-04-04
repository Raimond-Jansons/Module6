const linAlg = linearAlgebra(),
    Vector = linAlg.Vector,
    Matrix = linAlg.Matrix;

// let a = new Matrix([[1, 2, 3], [4, 5, 6]]);
// let b = new Matrix([[1], [3], [5]]);

// console.log(a.dot(b));

const norm_rand = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());


class NN {
    ls;
    ws;
    bs;
    lnum;

    constructor(layers) {
        this.ls = layers;
        this.lnum = layers.length;
        this.ws = Array(this.lnum - 1);
        this.bs = Array(this.lnum - 1);
        for (let i = 0; i < this.lnum - 1; i++) {
            this.ws[i] = Matrix.zero(layers[i + 1], layers[i]);
            this.bs[i] = Matrix.zero(layers[i + 1], 1);

            this.ws[i].map_(() => norm_rand() * 1.5);
            this.bs[i].map_(() => norm_rand() * 1.5);
        }
    }


    predict(input) {
        let a = Matrix.reshapeFrom(input, this.ls[0], 1);
        for (let i = 0; i < this.lnum - 1; i++) {
            const w = this.ws[i];
            const b = this.bs[i];
            a = w.dot(a).plus(b).sigmoid();
        }
        return a.data.map(v => v[0]);
    }

    static ind_of_max(arr) {
        let max = 0;
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] > arr[max]) {
                max = i;
            }
        }
        return max;
    }

    test(test_data, v = 0) {
        let count = 0;
        let error = 0;
        for (const { input: x, output: y } of test_data) {
            const p = this.predict(x);
            if (NN.ind_of_max(y) == NN.ind_of_max(p)) {
                count++;
            } else if (v) {
                console.log(x, y, p);
            }

            for (let i = 0; i < p.length; i++) {
                error += Math.pow(p[i] - y[i], 2);
            }

            // if (Math.round(p[0]) == y[0]) {
            //     count++;
            // }
            // if (v) {
            //     console.log(x, y, p);
            // }

        }
        return [count, error / test_data.length / test_data[0].output.length];
    }

    static shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
    }

    train(train_data, test_data, epochs, batch_size, learn_rate) {
        train_data = [...train_data];
        const test_freq = Math.pow(10, Math.floor(Math.log10(epochs)) - 1) / 2;
        for (let e = 0; e < epochs; e++) {
            NN.shuffle(train_data);
            for (let i = 0; i < train_data.length; i += batch_size) {
                this.train_batch(train_data, i, Math.min(i + batch_size, train_data.length), learn_rate);
            }
            if (e % test_freq == 0 || e == epochs - 1) {
                if (test_data) {
                    const [c, err] = this.test(test_data);
                    console.log(`Epoch ${e}: ${c} / ${test_data.length}, err: ${err}`);
                } else {
                    console.log(`Epoch ${e} complete`);
                }
            }
        }
    }

    train_batch(batch, start, end, learn_rate) {
        const total_delt_w = this.ws.map(w => Matrix.zero(w.rows, w.cols));
        const total_delt_b = this.bs.map(b => Matrix.zero(b.rows, b.cols));

        for (let i = start; i < end; i++) {
            const [delt_w, delt_b] = this.backprop(batch[i].input, batch[i].output);
            for (let j = 0; j < this.lnum - 1; j++) {
                total_delt_w[j].plus_(delt_w[j]);
                total_delt_b[j].plus_(delt_b[j]);
            }
        }

        for (let i = 0; i < this.lnum - 1; i++) {
            this.ws[i].minus_(total_delt_w[i].mulEach_(learn_rate / batch.length));
            this.bs[i].minus_(total_delt_b[i].mulEach_(learn_rate / batch.length));
        }
    }

    backprop(x, y) {
        let a = Matrix.reshapeFrom(x, x.length, 1);
        y = Matrix.reshapeFrom(y, y.length, 1);
        const activ_s = [a], zs = [];
        for (let i = 0; i < this.lnum - 1; i++) {
            const w = this.ws[i];
            const b = this.bs[i];
            const z = w.dot(a).plus(b);
            a = z.sigmoid();
            activ_s.push(a);
            zs.push(z);
        }


        const delt_w = Array(this.lnum - 1);
        const delt_b = Array(this.lnum - 1);

        const last_ind = this.lnum - 2;
        let error = NN.cost_derivative(a, y).mul(NN.sigmoid_prime(zs[last_ind]));

        delt_w[last_ind] = error.dot(activ_s[activ_s.length - 2].trans());
        delt_b[last_ind] = error;

        for (let i = last_ind - 1; i >= 0; i--) {
            const z = zs[i];
            const sp = NN.sigmoid_prime(z);
            error = this.ws[i + 1].trans().dot(error).mul(sp);

            delt_w[i] = error.dot(activ_s[i].trans());
            delt_b[i] = error;
        }

        return [delt_w, delt_b];
    }

    static cost_derivative(out_activations, y) {
        return out_activations.minus(y);
    }

    static sigmoid_prime(z) {
        const s = z.sigmoid();
        return s.mul(s.mulEach(-1).plusEach(1));
    }

    saveToFile() {
        const a = document.createElement("a");
        const file = new Blob([JSON.stringify(this)], { type: "text/plain;charset=utf-8" });
        a.href = URL.createObjectURL(file);
        a.download = "nn.json";
        a.click();
    }

    readFromFile(json) {
        const data = JSON.parse(json);
        this.lnum = data.lnum;
        this.ls = data.ls;
        this.ws = data.ws.map(w => new Matrix(w.data));
        this.bs = data.bs.map(b => new Matrix(b.data));
        console.log('loaded!');
    }
}


// const nn = new NN([25, 50, 30, 10]);
// const train_data = [
//     { x: [0, 0], y: [0] },
//     { x: [0, 1], y: [1] },
//     { x: [1, 0], y: [1] },
//     { x: [1, 1], y: [0] },
// ];


// let epochs = 1000;
// let batch_size = 5;
// let lr = 3;


// document.getElementById('trainBtn').onclick = () => {
//     nn.train(train_data, train_data, epochs, batch_size, lr);
// };

// function test_on_ds() {
//     return nn.test(train_data, 1);
// }

// const weights = [
//     [
//         [3.6155663, 3.58777351],
//         [5.90226116, 5.75244816]
//     ],
//     [
//         [-8.02718453, 7.36108835]
//     ]
// ];
// const biases = [
//     [
//         -5.51028634,
//         -2.41437943
//     ],
//     [
//         -3.29055112
//     ]
// ];
// nn.ws = weights.map(w => new Matrix(w));
// nn.bs = biases.map(b => Matrix.reshapeFrom(b, b.length, 1));


export default NN;