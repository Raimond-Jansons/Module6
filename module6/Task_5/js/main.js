import { train_data, test_data } from "./data_sample.js";


const round = (num) => Math.round(num * 1000) / 1000;
const sleep = (ms) => new Promise(res => setTimeout(res, ms));
const isNumeric = (str) => !isNaN(str) && !isNaN(parseFloat(str));
String.prototype.pad = function (size) {
    let s = this;
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}


class Node {
    splitP;
    splitV;
    lNode;
    rNode;
    domNode;

    isTerm = false;
    termClass;
    constructor(p, v) {
        this.splitP = p;
        this.splitV = v;
    }
}
class DecisionTree {

    maxDepth;
    minNodeSize;
    root;
    headers;
    colTypes;
    paramsNum;
    isEvaluating;

    constructor(rows, headers, colTypes, maxDepth, minNodeSize, domRoot) {
        this.isEvaluating = false;
        this.maxDepth = maxDepth;
        this.minNodeSize = minNodeSize;
        this.headers = headers;
        this.colTypes = colTypes;
        this.paramsNum = rows[0].length;
        this.root = this.split(rows, 1);
        this.root.domNode = domRoot;
        this.render(domRoot, this.root);

        this.evaluate(rows, false).then((accuracy) => {
            infoBlock.textContent = `Точность: ${round(accuracy)}`;
        });
    }

    gini_split_ind(groups) {
        let gini = 0;

        for (const group of groups) {
            if (group.length) {
                const classes_count = {};

                for (const row of group) {
                    const class_name = row[row.length - 1];
                    if (!classes_count[class_name]) {
                        classes_count[class_name] = 1;
                    } else {
                        classes_count[class_name]++;
                    }
                }

                let sum = 0;
                for (const count of Object.values(classes_count)) {
                    sum += count * count;
                }

                gini += sum / group.length;
            }
        }
        return gini;
    }

    split_by_num(parameter, value, rows) {
        const l = [], r = [];
        for (const row of rows) {
            if (row[parameter] < value) {
                l.push(row);
            } else {
                r.push(row);
            }
        }
        return [l, r];
    }

    split_by_class(split_classes, parameter, rows) {
        const l = [], r = [];
        for (const row of rows) {
            if (split_classes.has(row[parameter])) {
                l.push(row);
            } else {
                r.push(row);
            }
        }
        return [l, r];
    }

    get_unique_classes(rows, param_num) {
        const classes = new Set();
        for (const row of rows) {
            classes.add(row[param_num]);
        }
        return Array.from(classes);
    }

    bin_to_classes(bin, classes) {
        const resL = new Set();
        const resR = new Set();
        for (let i = 0; i < bin.length; i++) {
            if (bin.charAt(i) === "1") {
                resL.add(classes[i]);
            } else {
                resR.add(classes[i]);
            }
        }
        return [resL, resR];
    }

    best_split(rows) {
        let split = { param: -1, val: -1, groups: [[], rows] };
        let max_gini = -1;
        for (let p = 0; p < this.paramsNum - 1; p++) {
            if (this.colTypes[p] == 0) {
                rows.sort((a, b) => a[p] - b[p]);
                for (let i = 0; i < rows.length - 1; i++) {
                    const v = (rows[i][p] + rows[i + 1][p]) / 2;
                    const groups = this.split_by_num(p, v, rows);
                    const gini = this.gini_split_ind(groups);
                    if (gini > max_gini) {
                        max_gini = gini;
                        split = { param: p, val: v, groups };
                    }
                }
            } else {
                const classes = this.get_unique_classes(rows, p);
                for (let i = 1; i < Math.pow(2, classes.length - 1); i++) {
                    const bin = i.toString(2).pad(classes.length);
                    const [classesL, classesR] = this.bin_to_classes(bin, classes);
                    const groups = this.split_by_class(classesL, p, rows);
                    const gini = this.gini_split_ind(groups);
                    if (gini > max_gini) {
                        max_gini = gini;
                        split = { param: p, val: [classesL, classesR], groups };
                    }
                }
            }
        }
        return split;
    }

    mode_class(rows) {
        const classes_count = {};
        let max_count = 0, max_name;
        for (const row of rows) {
            const class_name = row[row.length - 1];
            if (!classes_count[class_name]) {
                classes_count[class_name] = 1;
            } else {
                classes_count[class_name]++;
            }
            if (classes_count[class_name] > max_count) {
                max_count = classes_count[class_name];
                max_name = class_name;
            }
        }
        return max_name;
    }

    num_unique_classes(rows) {
        if (!rows.length) return 0;
        const first_class = rows[0][rows[0].length - 1];
        for (const row of rows) {
            const class_name = row[row.length - 1];
            if (class_name !== first_class) {
                return 2;
            }
        }
        return 1;
    }

    split(rows, depth) {
        const split = this.best_split(rows);
        const node = new Node(split.param, split.val);
        const [l, r] = split.groups;
        if (depth > this.maxDepth || rows.length < this.minNodeSize || !l.length || !r.length || this.num_unique_classes(rows) < 2) {
            node.isTerm = true;
            node.termClass = this.mode_class(l.concat(r));
        } else {
            node.lNode = this.split(l, depth + 1);
            node.rNode = this.split(r, depth + 1);
        }

        return node;
    }

    clearPath() {
        const paths = document.getElementsByClassName('path');
        while (paths.length > 0) {
            paths[0].classList.remove('path');
        }
    }

    predict(row, draw) {
        let treeNode = this.root;
        if (draw) {
            this.clearPath();
            treeNode.domNode.classList.add('path');
        }
        while (!treeNode.isTerm) {
            if (this.colTypes[treeNode.splitP] == 0) {
                if (row[treeNode.splitP] < treeNode.splitV) {
                    treeNode = treeNode.lNode;
                } else {
                    treeNode = treeNode.rNode;
                }
            } else {
                if (treeNode.splitV[0].has(row[treeNode.splitP])) {
                    treeNode = treeNode.lNode;
                } else {
                    treeNode = treeNode.rNode;
                }
            }

            if (draw) {
                treeNode.domNode.classList.add('path');
            }
        }
        return treeNode.termClass;
    }

    async evaluate(rows, draw) {
        if (this.isEvaluating) {
            return;
        }
        this.isEvaluating = true;
        predictedBox.innerHTML = '';
        let count = 0;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const predicted = this.predict(row, draw);
            const span = document.createElement('span');
            if (row.length == this.paramsNum) {
                if (predicted == row[this.paramsNum - 1]) {
                    count++;
                } else {
                    span.classList.add('error');
                }
            }
            if (draw) {
                span.textContent = `(${i + 1}/${rows.length}) ${row.join(', ')}: ${predicted}`;
                predictedBox.append(span);
                predictedBox.append(document.createElement('br'));
                await sleep(1000 / document.getElementById('showSpeed').value);
                this.clearPath();
            }
        }
        const accuracy = count / rows.length;
        if (draw && rows[0].length == this.paramsNum) {
            predictedBox.append(document.createTextNode(`Точность: ${round(accuracy)}`));
        }
        this.isEvaluating = false;
        return accuracy;
    }

    createBranch(parent, text) {
        const valLi = document.createElement('li');
        parent.append(valLi);

        const span = document.createElement('span');
        span.textContent = text;
        valLi.append(span);

        const ul = document.createElement('ul');
        valLi.append(ul);

        const childLi = document.createElement('li');
        ul.append(childLi);

        return [childLi, valLi];
    }

    render(domNode, treeNode) {
        const span = document.createElement('span');
        span.className = 'parameter';
        domNode.append(span);

        if (treeNode.isTerm) {
            span.textContent = `${this.headers[this.paramsNum - 1]}: ${treeNode.termClass}`;
        } else {
            span.textContent = this.headers[treeNode.splitP];

            const ul = document.createElement('ul');
            domNode.append(ul);

            let lText = '';
            let rText = '';
            if (this.colTypes[treeNode.splitP] == 0) {
                lText = `< ${round(treeNode.splitV)}`;
                rText = `>= ${round(treeNode.splitV)}`;
            } else {
                lText = [...treeNode.splitV[0]].join();
                rText = [...treeNode.splitV[1]].join();
            }

            const [left, lVal] = this.createBranch(ul, lText);
            const [right, rVal] = this.createBranch(ul, rText);
            treeNode.lNode.domNode = lVal;
            treeNode.rNode.domNode = rVal;

            this.render(left, treeNode.lNode);
            this.render(right, treeNode.rNode);
        }
    }
}

let tree = null;
const root = document.querySelector('.root');
const trainInput = document.getElementById('csvInputTrain');
const testInput = document.getElementById('csvInputTest');
const infoBlock = document.querySelector('.info');

function build_tree(dataset, headers, colTypes) {
    root.innerHTML = '';
    console.time('build_tree');
    const maxDepth = document.getElementById('maxDepthInp').value;
    tree = new DecisionTree(dataset, headers, colTypes, maxDepth, 2, root);
    console.timeEnd('build_tree');
    console.log(tree.root);
}

function read_csv(csvText, isHeader) {
    const csv = csvText.split('\n');
    const dataset = [];
    let i = 0;
    let headers = null;
    if (isHeader) {
        i = 1;
        headers = csv[0].split(',').map(v => v.trim());
    } else {
        headers = csv[0].split(',').map((v, ind) => "P" + (ind + 1));
        headers[headers.length - 1] = "Ans";
    }

    const colTypes = Array(headers.length).fill(0); // 0-nums  1-classes
    for (; i < csv.length; i++) {
        const values = csv[i].split(',').map(v => v.trim());
        if (values.length > 1) {
            for (let j = 0; j < values.length - 1; j++) {
                if (colTypes[j] == 0) {
                    if (isNumeric(values[j])) {
                        values[j] = parseFloat(values[j]);
                    } else {
                        colTypes[j] = 1;
                    }
                }
            }
            dataset.push(values);
        }
    }
    return [dataset, headers, colTypes];
}


document.getElementById('loadSampleBtn').onclick = () => {
    trainInput.value = train_data;
    testInput.value = test_data;

};


document.getElementById('buildTreeBtn').onclick = () => {
    const csv = trainInput.value;
    const isHeader = document.getElementById('isHeaderTrain').checked;
    const [dataset, headers, colTypes] = read_csv(csv, isHeader);
    if (dataset.length > 0) {
        build_tree(dataset, headers, colTypes);
    } else {
        alert('Введите данные');
    }

};


const predictedBox = document.getElementById('predicted');

document.getElementById('predictBtn').onclick = () => {
    if (tree) {
        const csv = testInput.value;
        const isHeader = document.getElementById('isHeaderTest').checked;
        const [rows, headers, colTypes] = read_csv(csv, isHeader);
        tree.evaluate(rows, true);
    } else {
        alert('Сначала постройте дерево');
    }
};



const dropboxes = document.getElementsByTagName("textarea");
for (const dropbox of dropboxes) {
    dropbox.addEventListener("dragenter", dragenter, false);
    dropbox.addEventListener("dragleave", dragleave, false);
    dropbox.addEventListener("dragover", dragover, false);
    dropbox.addEventListener("drop", drop, false);
}


function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
    this.classList.add('over');
}

function dragleave(e) {
    e.stopPropagation();
    e.preventDefault();
    this.classList.remove('over');
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();
    this.classList.remove('over');
    
    const dt = e.dataTransfer;
    const files = dt.files;

    let reader = new FileReader();
    reader.readAsText(files[0]);
    reader.onload = function () {
        e.target.value = reader.result;
    };

    reader.onerror = function () {
        console.log(reader.error);
    };
}