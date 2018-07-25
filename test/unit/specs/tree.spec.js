import {
    Tree,
    Node,
    Edge,
	nodeNotFoundError,
	edgeNotFoundError,
	ruleNotFoundError,
	invalidNodeError,
	invalidEdgeError,
	invalidRuleError,
	nodeWithDuplicateIdError,
	edgeWithDuplicateIdError,
} from '@/tree'
import * as utils from '@/utils/utils'
import {
	Rule,
	DependencyRule,
	LevelRule,
	SkillPointRule,
} from '@/rules'

function generateRandomNode(id = -1) {
	var colour = utils.generateValidColourCode(6);
	var label = utils.randomString(10);
	if(id == -1) id = Math.floor(Math.random() * 100000);
	return new Node(id, label, colour);
}

function generateRandomEdge(id = -1) {
	if(id == -1) var id = Math.floor(Math.random() * 10000000);
	var source = Math.floor(Math.random() * 10000000);
	var target = Math.floor(Math.random() * 10000000);
	return new Edge(id, source, target);
}

function generateRandomRule(id = -1) {
	var types = ['level', 'skillpoint', 'dependency'];
	var index = Math.floor(Math.random() * 3);
	var type = types[index];
	if(id == -1) var id = Math.floor(Math.random() * 10000000);
	var rule;
	switch(type) {
		case 'level':
			var level = Math.floor(Math.random() * 100000);
			rule = new LevelRule(id, level);
			break;
		case 'skillpoint':
			var skillpoints = Math.floor(Math.random() * 100000000);
			rule = new SkillPointRule(id, skillpoints);
			break;
		case 'dependency':
			var node = Math.floor(Math.random() * 10000);
			rule = new DependencyRule(id, node);
			break;
	}
	return rule;
}

function randomizeRules(node, amount) {
	for(var i = 0; i < amount; i++)
		node.addRule(generateRandomRule());
}

describe('tree.js', () => {
    it('should initialize a tree without error', () => {
		for(var i = 0; i < 100; i++) {
			expect(() => {
				let tree = new Tree();
			}).not.toThrow();
		}
    })
    it('should initialize a node correctly', () => {
		for(var i = 0; i < 100; i++) {
			var colour = utils.generateValidColourCode(6);
			var label = utils.randomString(10);
			var id = Math.floor(Math.random() * 100000);
			var node;
			expect(() => {
				node = new Node(id, label, colour);
			}).not.toThrow();
			expect(node.id).toBe(id);
			expect(node.colour).toBe(colour);
			expect(node.label).toBe(label);
			expect(node.rules).toEqual([]);
		}
    })
	it('should initialize an edge correctly', () => {
		for(var i = 0; i < 100; i++) {
			var id = Math.floor(Math.random() * 10000000);
			var source = Math.floor(Math.random() * 10000000);
			var target = Math.floor(Math.random() * 10000000);
			var edge;
			expect(() => {
				edge = new Edge(id, source, target);
			}).not.toThrow();
			expect(edge.id).toBe(id);
			expect(edge.source).toBe(source);
			expect(edge.target).toBe(target);
		}
	})
	it('should add rules to a node correctly', () => {
		for(var i = 0; i < 100; i++) {
			var node = generateRandomNode();
			for(var i = 0; i < 10000; i++) {
				expect(() => {
					node.addRule(generateRandomRule());
				}).not.toThrow();
			}
		}
	})
	it('should only allow rules to be added to its rules', () => {
		var node = generateRandomNode();
		expect(() => {
			node.addRule({ id: 0, type: 'dependency', node: 10 });
		}).toThrow(invalidRuleError);
	})
	it('should clone a node correctly', () => {
		for(var i = 0; i < 100; i++) {
			var node = generateRandomNode();
			randomizeRules(node, 10000);
			var clone = node.clone();
			expect(node.compareTo(clone)).toBe(true);
			expect(node).not.toBe(clone);
			expect(node.rules).not.toBe(clone.rules);
		}
	})
	it('should clone an edge correctly', () => {
		for(var i = 0; i < 100; i++) {
			var edge = generateRandomEdge();
			var clone = edge.clone();
			expect(edge.compareTo(clone)).toBe(true);
			expect(edge).not.toBe(clone);
		}
	})
	it('should get and set attributes for a node correctly', () => {
		for(var i = 0; i < 100; i++) {
			var node = generateRandomNode();
			var newNode = generateRandomNode();
			expect(() => {
				node.label = newNode.label;
			}).not.toThrow();
			expect(() => {
				node.colour = newNode.colour;
			}).not.toThrow();
			expect(node.colour).toBe(newNode.colour);
			expect(node.label).toBe(newNode.label);
		}
	})
	it('should compare nodes successfully', () => {
		for(var i = 0; i < 100; i++) {
			var node = generateRandomNode();
			randomizeRules(node, 10000);
			expect(node.compareTo(node)).toBe(true);
		}
	})
	it('should compare edges successfully', () => {
		for(var i = 0; i < 100; i++) {
			var edge = generateRandomEdge();
			expect(edge.compareTo(edge)).toBe(true);
		}
	})
	it('should not allow editing of a node\'s id', () => {
		for(var i = 0; i < 100; i++) {
			var node = generateRandomNode();
			expect(() => {
				node.id = 0;
			}).toThrow();
		}
	})
	var currentNodeId = 0;
	var currentEdgeId = 0;
	//generate nodes
	var nodes = [];
	var nodesToDelete = [];
	for(var i = 0; i < 10000; i++) {
		var id = currentNodeId++;
		nodes.push(generateRandomNode(id));
		var p = Math.random();
		if(p < 0.4) nodesToDelete.push(id);
	}

	//generate edges
	var edges = [];
	var edgesToDelete = [];
	var inList = (id) => {
		var isIn = false;
		edges.forEach((item) => {
			if(item.id === id) isIn = true;
		})
		return isIn;
	}
	for(var i = 0; i < 1000; i++) {
		var from = Math.floor(Math.random() * nodes.length);
		var to = Math.floor(Math.random() * nodes.length);
		while(inList(`${from}-${to}`) || from === to) {
			from = Math.floor(Math.random() * nodes.length);
			to = Math.floor(Math.random() * nodes.length);
		}
		var id = `${from}-${to}`;
		edges.push(new Edge(id, from, to));
		var p = Math.random();
		if(p < 0.4) edgesToDelete.push(id);
	}
	var tree = new Tree();
	it('should add nodes correctly', () => {
		nodes.forEach((item) => {
			expect(() => {
				tree.addNode(item);
			}).not.toThrow();
			var n;
			expect(() => {
				n = tree.getNode(item.id);
			}).not.toThrow();
			expect(n.id).toBe(item.id);
			expect(n.label).toBe(item.label);
			expect(n.colour).toBe(item.colour);
			expect(n.rules).toEqual(item.rules);
		})
	})
	it('should not allow nodes with duplicate ids', () => {
		nodes.forEach((item) => {
			expect(() => {
				tree.addNode(item);
			}).toThrow(nodeWithDuplicateIdError);
		})
	})
	it('should throw an appropriate error when searching for a nonexistent node', () => {
		for(var i = 0; i < 100; i++) {
			var id = Math.floor(Math.random() * 10000) + nodes.length;
			expect(() => {
				tree.getNode(id);
			}).toThrow(nodeNotFoundError);
		}
	})
	it('should only allow nodes to be added as nodes', () => {
		expect(() => {
			tree.addNode({id: 0, label: 'test', colour: "#000", rules: [] });
		}).toThrow(invalidNodeError);
	})
	it('should add edges correctly', () => {
		edges.forEach((item) => {
			expect(() => {
				tree.addEdge(item);
			}).not.toThrow();
			var e;
			expect(() => {
				e = tree.getEdge(item.id);
			}).not.toThrow();
			expect(e.id).toBe(item.id);
			expect(e.source).toBe(item.source);
			expect(e.target).toBe(item.target);
		})
	})
	it('should not allow edges with duplicate ids', () => {
		edges.forEach((item) => {
			expect(() => {
				tree.addEdge(item);
			}).toThrow(edgeWithDuplicateIdError);
		})
	})
	it('should throw an appropriate error when searching for a nonexistent edge', () => {
		for(var i = 0; i < 100; i++) {
			var from = Math.floor(Math.random() * 10000) + edges.length;
			var to = Math.floor(Math.random() * 10000) + edges.length;
			var id = `${from}-${to}`;
			expect(() => {
				tree.getEdge(id);
			}).toThrow(edgeNotFoundError);
		}
	})
	it('should only allow edges to be added as edges', () => {
		expect(() => {
			tree.addEdge({ id: '0-1', source: 0, target: 1 });
		}).toThrow(invalidEdgeError);
	})
	it('should delete edges without error', () => {
		edgesToDelete.forEach((item) => {
			expect(() => {
				tree.deleteEdge(item);
			}).not.toThrow();
			expect(() => {
				tree.getEdge(item);
			}).toThrow(edgeNotFoundError);
		})
	})
	it('should throw an appropriate error when trying to delete a nonexistent edge', () => {
		edgesToDelete.forEach((item) => {
			expect(() => {
				tree.deleteEdge(item);
			}).toThrow(edgeNotFoundError);
		})
	})
	it('should delete nodes without error', () => {
		nodesToDelete.forEach((item) => {
			expect(() => {
				tree.deleteNode(item);
			}).not.toThrow();
			expect(() => {
				tree.getNode(item);
			}).toThrow(nodeNotFoundError);
		})
	})
	it('should throw an appropriate error when trying to delete a nonexistent node', () => {
		nodesToDelete.forEach((item) => {
			expect(() => {
				tree.deleteNode(item);
			}).toThrow(nodeNotFoundError);
		})
	})
	it('should add rules to a node correctly', () => {
		nodes.forEach(item => {
				let rule = generateRandomRule();
				if(nodesToDelete.indexOf(item.id) == -1) {
					expect(() => {
						tree.addRule(item.id, rule);
					}).not.toThrow()
					expect(tree.getNode(item.id).rules).toContain(rule)
				}
				else {
					expect(() => {
						tree.addRule(item.id, rule);
					}).toThrow(nodeNotFoundError);
				}
		})
	})
	it('should compare trees correctly', () => {
		expect(tree.compareTo(tree)).toBe(true);
	})
	it('should clone trees correctly', () => {
		var clone = tree.clone();
		expect(tree.compareTo(clone)).toBe(true);
		expect(tree).not.toBe(clone)
		expect(tree.edges).not.toBe(clone.edges);
		expect(tree.nodes).not.toBe(clone.nodes);
	})
	it('should clean the tree correctly', () => {
		expect(() => {
			tree.clean();
		}).not.toThrow();
		expect(() => {
			tree.getNode(0);
		}).toThrow(nodeNotFoundError);
		expect(tree.getNodes()).toEqual([]);
		expect(tree.nodes.length).toBe(0);
		expect(tree.edges.length).toBe(0);
	})
	var tree2 = new Tree();
	var nodes2 = [
		generateRandomNode(0),
		generateRandomNode(1),
		generateRandomNode(2),
		generateRandomNode(3),
		generateRandomNode(4),
		generateRandomNode(5),
	];
	var edges2 = [
		new Edge(0, 0, 1),
		new Edge(1, 1, 2),
		new Edge(2, 1, 5),
		new Edge(3, 3, 1),
	];
	nodes2.forEach((item) => {
		tree2.addNode(item);
	});
	edges2.forEach((item) => {
		tree2.addEdge(item);
	});
	it('should get the connected edges correctly', () => {
		expect(() => {
			tree2.getConnectedEdges(1);
		}).not.toThrow();
		expect(tree2.getConnectedEdges(1)).toEqual(edges2);
	})
	it('should get the edges pointing to a node correctly', () => {
		expect(() => {
			tree2.getEdgesPointingTo(1);
		}).not.toThrow();
		expect(tree2.getEdgesPointingTo(1)).toEqual(
			edges2.filter(edge => edge.target == 1)
		)
	})
	it('should delete connected edges when a node is deleted', () => {
		tree2.deleteNode(1);
		edges2.forEach((item) => {
			expect(() => {
				tree2.getEdge(item.id);
			}).toThrow(edgeNotFoundError);
		});
	})
})
