import {
    store,
	treeNotInitializedError,
	cytoscapeNotInitializedError,
	globalVarExistsError,
	globalVarNotFoundError,
	invalidColourError,
} from '@/store/index'
import * as utils from '@/utils/utils'

function addNode(label) {
    store.commit('addNode', {
        label: label,
    });
}

var errorChecking = [
	{
		when: 'tree is not initialized',
		expectedError: treeNotInitializedError,
		mutations: [
			['addNode'],
			['updateNode'],
			['updateDisplay'],
			['deleteRule'],
			['addEdge'],
			['deleteNode'],
			['deleteEdge'],
			['updateDependencies'],
			['addRule'],
			['clean'],
			['undo'],
			['redo'],
		]
	},
	{
		when: 'cytoscape is not initialized',
		expectedError: cytoscapeNotInitializedError,
		mutations: [
			['moveNode'],
			['refreshCytoscape'],
			['layout'],
			['autoLayout'],
			['addSelectListener'],
			['addDeselectListener'],
			['setCytoscapeJson'],
		]
	}
]

function mockMoveListener(evt) {
	//do nothing (for now at least)
}

var colourConfig = require('./testData/colours.json');

function initialize() {
	let container = document.createElement('div');
	store.commit('init', {
			container: container,
			moveListener: mockMoveListener,
	});
}

describe('store/index.js', () => {
    for(var i in errorChecking) {
		let item = errorChecking[i];
		it(`should throw an appropriate error when ${item.when}`, () => {
			for(var j in item.mutations) {
				let m = item.mutations[j];
				expect(() => {
					store.commit(...m);
				}).toThrow(item.expectedError);
			}
		})
	}
    it('should initialize without error', () => {
        expect(() => {
            let container = document.createElement('div');
            store.commit('init', {
                container: container,
                moveListener: mockMoveListener
            })
        }).not.toThrow();
    })
    it('should add nodes without error', () => {
        expect(() => {
			addNode('something'); 
        }).not.toThrow();
        store.commit('clean') //clean up
    })
    it('should add nodes correctly', () => {
        let container = document.createElement('div');
        store.commit('init', container);
        for (var i = 0; i < 100; i++) {
            let label = utils.randomString();
            expect(() => {
				addNode(label); 
            }).not.toThrow();
            expect(
                store.getters.getNodeLabel(i)
            ).toBe(label);
        }
    })
    it('should throw an appropriate error when a node is not found', () => {
        expect(() => {
            store.getters.getNodeLabel(1000)
        }).toThrow('Node not found');
    })
	it('should not accept invalid colours', () => {
		//invalid html colour names
		for(var i in colourConfig.invalidColourNames) {
			let c = colourConfig.invalidColourNames[i];
			expect(() => {
				store.commit('updateNode', {
						id: 0,
						label: 'test',
						colour: c
				});
			}).toThrow(invalidColourError);
		}

		//invalid html colour codes
		//three digits
		for(var i = 0; i < 100; i++) {
			var c = utils.generateInvalidColourCode(3);
			expect(() => {
				store.commit('updateNode', {
						id: 0,
						label: 'test',
						colour: c
				});
			}).toThrow(invalidColourError);
		}
		//six digits
		for(var i = 0; i < 100; i++) {
			var c = utils.generateInvalidColourCode(6);
			expect(() => {
				store.commit('updateNode', {
						id: 0,
						label: 'test',
						colour: c
				});
			}).toThrow(invalidColourError);
		}
		//valid characters but invalid length
		for(var i = 0; i < 100; i++) {
			var len = Math.floor(Math.random() * 10);
			while(len == 3 || len == 6)
				len = Math.floor(Math.random() * 10);

			var c = utils.generateValidColourCode(len);
			expect(() => {
				store.commit('updateNode', {
						id: 0,
						label: 'test',
						colour: c
				});
			}).toThrow(invalidColourError);
		}
	})
	var undoableOperations = [
		['addNode', {label: 'test', moveListener: mockMoveListener}],
		['updateNode', {
			id: 0,
			label: utils.randomString(10),
			colour: utils.generateValidColourCode(6)
		}],
		['addEdge', {source: 0, target: 1}],
		['deleteEdge', '0-1'],
		['refreshCytoscape'],
		['addRule', {skill: 0}],
		['deleteRule', {skill: 0, rule: 0}],
		['deleteNode', 0],
		['autoLayout', {animate: false}],
	]
	let redoStack = [];
	let undoStack = [];
	it('should undo correctly', () => {
		//setup initial environment
		store.commit('clean');
		addNode(utils.randomString(10));
		addNode(utils.randomString(10));
		addNode(utils.randomString(10));
		addNode(utils.randomString(10));

		//apply changes, and save to stack
		for(var i in undoableOperations) {
			let op = undoableOperations[i];
			undoStack.push({
					tree: store.getters.getTree.clone(),
					cytoscape: store.getters.getCytoscapeJson,
			});
			store.commit(...op);
		}
		//test undoing of operations
		while(undoStack.length > 0) {
			redoStack.push({
					tree: store.getters.getTree.clone(),
					cytoscape: store.getters.getCytoscapeJson,
			});
			let oldState = undoStack.pop();
			store.commit('undo');
			let newState = {
				tree: store.getters.getTree,
				cytoscape: store.getters.getCytoscapeJson,
			};
			//sort arrays as order gets changed
			let elements = [oldState.cytoscape.elements, newState.cytoscape.elements];
			for(var i in elements) {
				if(elements[i].nodes)
					elements[i].nodes.sort((a, b) => {
						return a.data.id < b.data.id;
					});
				if(elements[i].edges)
					elements[i].edges.sort((a, b) => {
						return a.data.id < b.data.id;
					});
			}
			expect(
				newState.tree.compareTo(oldState.tree)
			).toBe(true);
			expect(
				newState.cytoscape
			).toEqual(oldState.cytoscape);
		}

	})
	it('should redo correctly', () => {
		while(redoStack.length > 0) {
			let oldState = redoStack.pop();
			store.commit('redo');
			let newState = {
				tree: store.getters.getTree.clone(),
				cytoscape: store.getters.getCytoscapeJson,
			};

			//sort arrays as order gets changed
			let elements = [oldState.cytoscape.elements, newState.cytoscape.elements];
			for(var i in elements) {
				if(elements[i].nodes)
					elements[i].nodes.sort((a, b) => {
						return a.data.id < b.data.id;
					});
				if(elements[i].edges)
					elements[i].edges.sort((a, b) => {
						return a.data.id < b.data.id;
					});
			}
			expect(
				newState.tree.compareTo(oldState.tree)
			).toBe(true);
			expect(
				newState.cytoscape
			).toEqual(oldState.cytoscape);
		}
	})
	it('should accept any valid colour', () => {
		//any valid html colour name
		for(var i in colourConfig.validColourNames) {
			let c = colourConfig.validColourNames[i];
			expect(() => {
				store.commit('updateNode', {
						id: 0,
						label: 'test',
						colour: c
				}).not.toThrow();
			});
		}

		//valid html colour codes
		//three digits
		for(var i = 0; i < 100; i++) {
			let c = utils.generateValidColourCode(3);
			expect(() => {
				store.commit('updateNode', {
						id: 0,
						label: 'test',
						colour: c
				}).not.toThrow();
			});
		}
		//six digits
		for(var i = 0; i < 100; i++) {
			let c = utils.generateValidColourCode(6);
			expect(() => {
				store.commit('updateNode', {
						id: 0,
						label: 'test',
						colour: c
				}).not.toThrow();
			});
		}
		
	})
    it('should clean up properly', () => {
		expect(() => {
			store.commit('clean');
		}).not.toThrow();
        expect(() => {
            store.getters.getNodeLabel(0)
        }).toThrow('Node not found');
    })
})
