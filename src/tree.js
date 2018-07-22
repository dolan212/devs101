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
	compareTo(other) {
		return (
			this.id === other.id &&
			this.source === other.source &&
			this.target === other.target
		);
	}
	clone() {
		var newEdge = new Edge(this.id, this.source, this.target);
		return newEdge;
	}
}
var desc = '';
export class Node {
    constructor(id, label, colour) {
        this._id = id;
        this._label = label;
        this._colour = colour;
        this.rules = [];
    }
    set label(label) {
        this._label = label;
    }
    set description(description) {
        this._description = description;
    }
    get description() {
        return this._description;
    }
    get label() {
        return this._label;
    }
    set colour(colour) {
        this._colour = colour;
    }
    get colour() {
        return this._colour;
    }
    get id() {
        return this._id;
    }
	addRule(rule) {
		this.rules.push(rule);
	}
    getRules() {
		return this.rules;
    }
    deleteRule(rule_id) {
        let index = -1;
        for (var i = 0; i < this.rules.length; i++) {
            if (this.rules[i].id == rule_id) index = i;
        }
        if (index != -1) {
            this.rules.splice(index, 1);
        } else throw "Rule not found";

    }
	clone() {
		var newNode = new Node(this.id, this.label, this.colour);
		for(var i = 0; i < this.rules.length; i++) {
			newNode.addRule(this.rules[i].clone());
		}
		return newNode;
	}
	compareTo(other) {
		if(this.rules.length !== other.rules.length) return false;
		for(var i in this.rules) {
			if(!this.rules[i].compareTo(other.rules[i])) return false;
		}
		return (
			this.id === other.id &&
			this.label === other.label &&
			this.colour === other.colour
		);
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
    updateNode(id, _label, _colour) {
        var n = this.nodes.find(x => x.id == id);
        n.label = _label;
        n.colour = _colour;
    }
    getNodes() {
        var nodesList = [];
        for (var i = 0; i < this.nodes.length; i++) {
            var n = this.nodes[i];
            nodesList.push({
                id: n.id,
                label: n.label,
                colour: n.colour,
                rules: n.rules,
            });
        }
        return nodesList;
    }
    deleteNode(id) {
        let index = -1;
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].id == id) index = i;
        }
        if (index != -1) {
            let edgesToDelete = [];
            for (var i in this.edges) {
                if (this.edges[i].source == id || this.edges[i].target == id)
                    edgesToDelete.push(this.edges[i].id);
            }
            this.nodes.splice(index, 1);
            for (var i in edgesToDelete) {
                this.deleteEdge(edgesToDelete[i]);
            }
        } else throw "Node not found";
    }
    deleteRule(skill_id, rule) {
        let skill = this.getNode(skill_id);
        skill.deleteRule(rule);
    }
    deleteEdge(id) {
        let index = -1;
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].id == id) index = i;
        }
        if (index != -1) this.edges.splice(index, 1);
        else throw "Edge not found";
    }
    getConnectedEdges(id) {
        var edges = [];
        for (var i in this.edges) {
            if (this.edges[i].target == id)
                edges.push(this.edges[i]);
        }
        return edges;
    }
    addRule(skill, rule) {
        let node = this.getNode(skill);
        node.rules.push(rule);
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
        for (var i = 0; i < this.nodes.length; i++) {
			newTree.addNode(this.nodes[i].clone());
        }
        for (var i = 0; i < this.edges.length; i++) {
			newTree.addEdge(this.edges[i].clone());
        }

        return newTree;
    }
	compareTo(other) {
		if(this.nodes.length !== other.nodes.length) return false;
		if(this.edges.length !== other.edges.length) return false;
		for(var i in this.nodes) {
			let t = this.nodes[i];
			let o = other.nodes[i];
			if(!t.compareTo(o)) return false;
		}
		for(var i in this.edges) {
			let t = this.edges[i];
			let o = other.edges[i];
			if(!t.compareTo(o)) return false;
		}
		return true;
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
    let color = color;
    let node = new Node(id, label, color);
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
