export class Edge {
    constructor(id, source, target) {
        this._id = id;
        this._source = source;
        this._target = target;
    }
    get id() {
        return this._id
    }
    set source(source) {
        this._source = source;
    }
    get source() {
        return this._source;
    }
    set target(target) {
        this._target = target;
    }
    get target() {
        return this._target;
    }
}

export class Node {
    constructor(id, label) {
        this._id = id;
        this._label = label;
    }
    set label(label) {
        this._label = label;
    }
    get label() {
        return this._label;
    }
    get id() {
        return this._id;
    }
}

export class Tree {
    constructor() {
        this.nodes = [];
        this.edges = [];
    }
    addNode(node) {
        this.nodes.push(node);
    }
    addEdge(edge) {
        this.edges.push(edge);
    }
    getNode(id) {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].id === id) return this.nodes[i];
        }
        throw "Node not found";
    }
    updateNode(id, _label) {
        var n = this.nodes.find(x => x.id == id);
        n.label = _label;
    }
    getNodes() {
        var nodesList = [];
        for (var i = 0; i < this.nodes.length; i++) {
            var n = this.nodes[i];
            nodesList.push({
                id: n.id,
                label: n.label
            });
        }
        return nodesList;
    }
    deleteNode(id) {
        let index = -1;
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].id === id) index = i;
        }
        if (index == -1) this.nodes.splice(index, 1);
        else throw "Node not found";
    }
    clean() {
        this.nodes.length = 0;
        this.edges.length = 0;
    }
}

var currentId;
var edgeId;

var tree;

export function initialize() {
    tree = new Tree();
    currentId = 0;
}

export function addNode(label) {
    if (!tree) throw "Tree not initialized"; //tree hasn't been initialized yet, so we error
    let id = currentId++;
    let node = new Node(id, label);
    tree.addNode(node);
    return id; //return id to be used for cytoscape
}

export function addEdge(source, target) {
    if (!tree) throw "Tree not initialized";
    let id = edgeId++;
    let edge = new Edge(id, source, target);
    tree.addEdge(source, target);
    return id;
}

export function deleteNode(id) {
    if (!tree) throw "Tree not initialized"; //tree not yet initialized
    tree.deleteNode(id);
}

export function getLabel(id) {
    let node = tree.getNode(id);
    return node.label;
}

export function clean() {
    tree.clean();
    currentId = 0;
}
