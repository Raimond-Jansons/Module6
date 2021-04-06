class Node {

    splitP;
    splitV;
    lNode;
    rNode;

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

    constructor(rows, headers, maxDepth, minNodeSize, domRoot) {
        this.maxDepth = maxDepth;
        this.minNodeSize = minNodeSize;
        this.headers = headers;
        this.root = this.split(rows, 1);

        this.render(domRoot, this.root);
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

    split_by(parameter, value, rows) {
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

    best_split(rows) {
        let split = { param: -1, val: -1, groups: [] };
        let max_gini = 0;
        for (let p = 0; p < rows[0].length - 1; p++) {
            for (const row of rows) {
                const v = row[p];
                const groups = this.split_by(p, v, rows);
                const gini = this.gini_split_ind(groups);
                if (gini >= max_gini) {
                    max_gini = gini;
                    split = { param: p, val: v, groups };
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

    render(domNode, treeNode) {
        const span = document.createElement('span');
        domNode.append(span);

        if (treeNode.isTerm) {
            span.textContent = `${this.headers[this.headers.length - 1]}: ${treeNode.termClass}`;
        } else {
            span.textContent = `${this.headers[treeNode.splitP]} < ${treeNode.splitV}`

            const ul = document.createElement('ul');
            domNode.append(ul);

            const li_yes = document.createElement('li');
            li_yes.className = 'yes';
            ul.append(li_yes);

            const li_no = document.createElement('li');
            li_no.className = 'no';
            ul.append(li_no);

            this.render(li_yes, treeNode.lNode);
            this.render(li_no, treeNode.rNode);
        }
    }
}

// const dataset = [[2.771244718, 1.784783929, 0],
// [1.728571309, 1.169761413, 0],
// [3.678319846, 2.81281357, 0],
// [3.961043357, 2.61995032, 0],
// [2.999208922, 2.209014212, 0],
// [7.497545867, 3.162953546, 1],
// [9.00220326, 3.339047188, 1],
// [7.444542326, 0.476683375, 1],
// [10.12493903, 3.234550982, 1],
// [6.642287351, 3.319983761, 1]];


function build_tree(dataset, headers) {
    const root = document.querySelector('.root');
    root.innerHTML = '';
    const tree = new DecisionTree(dataset, headers, 5, 1, root);
    console.log(tree.root);
}


document.getElementById('buildTreeBtn').onclick = () => {
    let csv = document.getElementById('csv_input').value;
    csv = csv.split('\n');
    const dataset = [];
    const headers = csv[0].split(',').map(v => v.trim());
    for (let i = 1; i < csv.length; i++) {
        const values = csv[i].split(',').map(v => v.trim());
        if (values.length > 1) {
            for (let j = 0; j < values.length - 1; j++) {
                values[j] = parseFloat(values[j]);
            }
            dataset.push(values);
        }
    }
    build_tree(dataset, headers);
};




const dropbox = document.getElementById("csv_input");
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    const dt = e.dataTransfer;
    const files = dt.files;

    let reader = new FileReader();
    reader.readAsText(files[0]);
    reader.onload = function () {
        document.getElementById('csv_input').value = reader.result;
    };

    reader.onerror = function () {
        console.log(reader.error);
    };
}