import {Rule} from '@/rules'

export const ruleNotFoundError = "Rule not found";
export const nodeNotFoundError = "Node not found";
export const edgeNotFoundError = "Edge not found";
export const invalidNodeError = "Invalid node given";
export const invalidEdgeError = "Invalid edge given";
export const invalidRuleError = "Invalid rule given";
export const nodeWithDuplicateIdError = "A node with that id already exists";
export const edgeWithDuplicateIdError = "An edge with that id already exists";

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
        this.max_times = 1;
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
		if(!(rule instanceof Rule)) throw invalidRuleError;
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
        } else throw ruleNotFoundError;

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
	compareToJson(json) {
		if(json.rules.length !== this.rules.length) return false;
		let comp = (a, b) => { return a.id < b.id; };
		json.rules.sort(comp);
		this.rules.sort(comp);
		for(var i in this.rules) {
			if(!this.rules[i].compareTo(json.rules[i])) return false;
		}
		return (
			json._id == this.id &&
			json._label == this.label &&
			json._colour == this.colour
		);
	}
}

export class Tree {
    constructor() {
        this.nodes = [];
        this.edges = [];
    }
    addNode(node) {
		if(!(node instanceof Node)) throw invalidNodeError;
		if(this.containsNode(node.id)) throw nodeWithDuplicateIdError;
        this.nodes.push(node);
    }
    addEdge(edge) {
		if(!(edge instanceof Edge)) throw invalidEdgeError;
		if(this.containsEdge(edge.id)) throw edgeWithDuplicateIdError;
        this.edges.push(edge);
    }
	containsNode(id) {
		var contains = false;
		this.nodes.forEach((item) => {
			if(item.id == id) contains = true;
		});
		return contains;
	}
	containsEdge(id) {
		var contains = false;
		this.edges.forEach((item) => {
			if(item.id == id) contains = true;
		});
		return contains;
	}
    getNode(id) {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].id === id) return this.nodes[i];
        }
        throw nodeNotFoundError;
    }
    updateNode(id, _label, _colour, _description, max_times) {
        var n = this.nodes.find(x => x.id == id);
        n.label = _label;
        n.colour = _colour;
        n.description = _description;
        n.max_times = max_times;
    }
    getNodes() {
        var nodesList = [];
        for (var i = 0; i < this.nodes.length; i++) {
            var n = this.nodes[i];
            nodesList.push({
                id: n.id,
                label: n.label,
                colour: n.colour,
                description: n.description,
                rules: n.rules,
                max_times: n.max_times
            });
        }
        return nodesList;
    }
	getEdge(id) {
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].id === id) return this.edges[i];
        }
        throw edgeNotFoundError;
	}
    deleteNode(id) {
        let index = -1;
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].id == id) index = i;
        }
        if (index != -1) {
			let edgesToDelete = this.getConnectedEdges(id);
            this.nodes.splice(index, 1);
            for (var i in edgesToDelete) {
                this.deleteEdge(edgesToDelete[i].id);
            }
        } else throw nodeNotFoundError;
    }
    deleteRule(skill_id, rule) {
        let skill = this.getNode(skill_id);
        skill.deleteRule(rule);
    }
	printNumNodes() {
		console.log(this.nodes.length);
	}
    deleteEdge(id) {
        let index = -1;
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].id == id) index = i;
        }
        if (index != -1) this.edges.splice(index, 1);
        else throw edgeNotFoundError;
    }
    getConnectedEdges(id) {
		return this.edges.filter(edge => edge.target == id || edge.source == id);
    }
	getEdgesPointingTo(id) {
		return this.edges.filter(edge => edge.target == id);
	}
    addRule(skill, rule) {
		let node = this.getNode(skill);
		node.addRule(rule);
    }
    getRules(skill) {
        let node = this.getNode(skill);
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
