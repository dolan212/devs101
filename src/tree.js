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
var desc = '';
export class Node {
    constructor(id, label,description) {
        this._id = id;
        this._label = label;
		this._description  = description;
		this.rules = [];
    }
    set label(label) {
        this._label = label;
    }
	set description(description){
		this._description = description;
	}
	get description(){
		return this._description;
	}
    get label() {
        return this._label;
    }
    get id() {
        return this._id;
    }
	getRules() {
		return this.rules;
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
		return this.nodes;
    }
    deleteNode(id) {
        let index = -1;
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].id == id) index = i;
        }
        if (index != -1) {
			let edgesToDelete = [];
			for(var i in this.edges) {
				if(this.edges[i].source == id || this.edges[i].target == id)
					edgesToDelete.push(this.edges[i].id);
			}
			this.nodes.splice(index, 1);
			for(var i in edgesToDelete) {
				this.deleteEdge(edgesToDelete[i]);
			}
		}
        else throw "Node not found";
    }
	deleteEdge(id) {
		let index = -1;
		for(var i = 0; i < this.edges.length; i++) {
			if(this.edges[i].id == id) index = i;
		}
		if(index != -1) this.edges.splice(index, 1);
		else throw "Edge not found";
	}
	getConnectedEdges(id) {
		var edges = [];
		for(var i in this.edges) {
			if(this.edges[i].target == id)
				edges.push(this.edges[i]);
		}
		return edges;
	}
    addRule(skill, rule) {
        let node = this.getNode(skill);
        node.rules.push(rule);
		console.log(node.rules.length);
    }
	getRules(skill) {
		let node = getNode(skill);
		return node.getRules();
	}
    clean() {
        this.nodes.length = 0;
        this.edges.length = 0;
    }
	clone() {
		let newTree = new Tree();
		for(var i = 0; i < this.nodes.length; i++) {
			newTree.addNode(this.nodes[i]);
		}
		for(var i = 0; i < this.edges.length; i++) {
			newTree.addEdge(this.edges[i]);
		}

		return newTree;
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
	let description = desc;// description set to null on addition of a node
    let node = new Node(id, label,description);
    tree.addNode(node);
    return id; //return id to be used for cytoscape
}

export function addEdge(source, target) {
    if (!tree) throw "Tree not initialized";
    let id = Id++;
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

export function getDescription(id) {
	let node = tree.getNode(id);
	return node.description;
}

export function clean() {
    tree.clean();
    currentId = 0;
}
