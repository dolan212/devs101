//store
var tree;
var rules[];
var cy;

function init(div, json)
{
    try {
      JSON.parse(json);
      var vals=setupFromJson(json);

      tree = vals[0];
      g = vals[1];
      var cytJson = vals[2];
      document.getElementById(div).innerHTML = "<div id='globals'></div><div id='cytoscape'></div>"
    } catch (e) {

    } finally {

    }
}

function setupFromJson(jsonString) {
    try {
        var tree = JSON.parse(jsonString);

        var t = buildTreeFromJsonObject(tree.tree);
        var g = tree.globals;
        var c = tree.cytoscape;
        return [t,g,c];
    } catch (e) {
        alert("The json file is not valid");
        console.log(e);
    }
}

function buildTreeFromJsonObject(obj) {
    var tree = new Tree();
    for (var n in obj.nodes) {
        if (obj.nodes.hasOwnProperty(n)) {
            var newNode = new Node(obj.nodes[n]._id, obj.nodes[n]._label, obj.nodes[n]._colour);
            newNode.rules = obj.nodes[n].rules;
            tree.addNode(newNode);
        }
    }
    for (var v in obj.edges) {
        if (obj.edges.hasOwnProperty(v)) {
            var newEdge = new Edge(obj.edges[v]._id, obj.edges[v]._source, obj.edges[v]._target);
            tree.addNode(newEdge);
            console.log(newEdge);
        }
    }
    return tree;
}

//classes
const ruleNotFoundError = "Rule not found";
const nodeNotFoundError = "Node not found";
const edgeNotFoundError = "Edge not found";
const invalidNodeError = "Invalid node given";
const invalidEdgeError = "Invalid edge given";
const invalidRuleError = "Invalid rule given";
const nodeWithDuplicateIdError = "A node with that id already exists";
const edgeWithDuplicateIdError = "An edge with that id already exists";

class Edge {
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
class Node {
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

class Tree {
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
    deleteEdge(id) {
        let index = -1;
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].id == id) index = i;
        }
        if (index != -1) this.edges.splice(index, 1);
        else throw edgeNotFoundError;
    }
    getConnectedEdges(id) {
        var edges = [];
        for (var i in this.edges) {
            if (this.edges[i].target == id || this.edges[i].source == id)
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

class Rule {
    constructor(id) {
        this.id = id;
        this.type = "null";
    }
	compareTo(other) {
		if(this.type !== other.type) return false;
		switch(this.type) {
			case 'skillpoint':
				return this.node === other.node;
			case 'level':
				return this.level === other.level;
			case 'skillpoint':
				return this.skillpoints === other.skillpoints;
			default:
				return true;
		}
	}
}

class DependencyRule extends Rule {
    constructor(id, node) {
        super(id);
        this.node = node;
        this.type = "dependency";
    }
	clone() {
		var newRule = new DependencyRule(this.id, this.node);
		return newRule;
	}
}

class LevelRule extends Rule {
    constructor(id, level) {
        super(id);
        this.level = level;
        this.type = "level";
    }
	clone() {
		var newRule = new LevelRule(this.id, this.level);
		return newRule;
	}
}

class SkillPointRule extends Rule {
    constructor(id, skillpoints) {
        super(id);
        this.skillpoints = skillpoints;
        this.type = "skillpoint";
    }
	clone() {
		var newRule = new SkillPointRule(this.id, this.skillpoints);
		return newRule;
	}
}

class Global {

    constructor(name, type, defaultVal, req) {
        this._name = name;
        this._type = type;
        this._value = defaultVal;
        this._required = req;

    }

    set name(name) {
        this._name = name;
    }
    set value(val) {
        this._value = val;
    }
    set type(type) {
        return this._type = type;
    }
    set required(req) {
        this._required = req;
    }
    get name() {
        return this._name;
    }
    get type() {
        return this._type;
    }
    get value() {
        return this._value;
    }
    get required() {
        return this._required;
    }

}


class GlobalString extends Global {

    constructor(name, type, defaultVal, req) {
        //this._name = name;
        //this._type = type;
        if (typeof defaultVal == "string") {
            //this._value = defaultVal;
            super(name, type, defaultVal, req);
        } else {
            //this._value = "";
            defaultVal = "";
            console.log("Incorrect default value type");
            super(name, type, defaultVal, req);
        }
        //this._required = req;
    }

    set value(val) {
        if (typeof val == "string") {
            super.value(val);
        } else {
            val = "";
            console.log("Incorrect default value type");
            super.value(val);
        }
    }

}

class GlobalNumber extends Global {

    constructor(name, type, defaultVal, req) {
        //this._name = name;
        //this._type = type;
        if (typeof defaultVal == "number") {
            //this._value = defaultVal;
            super(name, type, defaultVal, req);
        } else {
            //this._value = "";
            defaultVal = 0;
            console.log("Incorrect default value type");
            console.log("Default value set to zero");
            super(name, type, defaultVal, req);
        }
        //this._required = req;
    }

    set value(val) {
        if (typeof val == "number") {
            super.value(val);
        } else {
            val = 0;
            console.log("Incorrect default value type");
            console.log("Default value set to zero");
            super.value(val);
        }
    }

}

class GlobalMultiSelect extends Global {

    constructor(name, type, defaultVal, req, vals) {
        //this._name = name;
        //this._type = type;
        if (vals.constructor === Array) {
            //this._value = defaultVal;
            var correct = false;
            for (var i = 0; i < vals.length; i++) {
                if (defaultVal == vals[i]) {
                    //super(name, type, defaultVal, req);
                    correct = true;
                    break;
                }
            }
            if (correct) {
                super(name, type, defaultVal, req);
            } else {
                console.log("Incorrect default value type");
                console.log("Default value set to vals array's first value");
                defaultVal = vals[0];
                super(name, type, defaultVal, req);
            }

            this._options = vals.slice();
        } else {
            //this._value = "";
            defaultVal = "";
            console.log("Incorrect default value and vals is not an array");
            console.log("Default value set to empty string and options set to empty array");
            super(name, type, defaultVal, req);
            this._options = [];
        }
        //this._required = req;
    }

    set value(val) {
        if (this._options.constructor === Array) {
            var correct = false;
            for (var i = 0; i < this._options.length; i++) {
                if (val == this._options[i]) {
                    //super(name, type, defaultVal, req);
                    correct = true;
                    break;
                }
            }
            if (correct) {
                super.value(val);
            } else {
                console.log("Incorrect default value type");
                console.log("Default value set to options array's first value");
                val = this._options[0];
                super.value(val);
            }
        } else {
            val = "";
            console.log("Incorrect default value and vals is not an array");
            console.log("Default value set to empty string and options set to empty array");
            super.value(val);
            this._options = [];
        }
    }

    get options() {
        return this._options;
    }
    set options(vals) {
        if (vals.constructor === Array) {
            this._options = vals.slice();
        } else {
            console.log("Incorrect vals is not an array");
            console.log("Options set to empty array");
            this._options = [];
        }
    }
}
function globals(name, type, defaultVal, req) {
    var gVar = Global(name, type, defaultVal, req);
    return gVar;
}
