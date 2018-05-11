import Vue from 'vue';
import Vuex from 'vuex';
import tree from './modules/treeStore'
import persistentState from "vuex-persistedstate"
import {
    Tree,
    Node,
    Edge
} from '@/tree'
import * as controller from '@/controller'
import cytoscape from 'cytoscape'
import undoredo from 'cytoscape-undo-redo'

Vue.use(Vuex);


export const store = new Vuex.Store({
    state: {
        tree: null,
        currentId: 0,
        cy: null,
        treeUndoStack: [],
        jsonUndoStack: [],
        treeRedoStack: [],
        jsonRedoStack: [],
        json: ""

    },
    getters: {
        getNodeLabel(state) {
            return id => state.tree.getNode(id).label;
        },
        getNodes(state) {
            return state.tree.getNodes();
        }
    },

    mutations: {
        init(state, container) {
            state.tree = new Tree();
            if (state.treeNodes) state.tree.nodes = Array.from(state.treeNodes, x => new Node(x._id, x._label));
            if (state.treeEdges) state.tree.edges = Array.from(state.treeNodes, x => new Edge(x._id, x._source, x._target));
            state.cy = cytoscape({
                container: container,
                elements: [],
                style: [{
                        selector: 'node',
                        style: {
                            'background-color': 'purple',
                            'label': 'data(label)'
                        }
                    },
                    {
                        selector: 'node:selected',
                        style: {
                            'border-color': 'yellow',
                            'border-width': 3,
                            'border-opacity': 1
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'width': 3,
                            'line-color': '#ccc',
                            'curve-style': 'bezier',
                            'target-arrow-shape': 'triangle'
                        }
                    }
                ],
                layout: {
                    name: 'random',
                }
            });
            state.cy.maxZoom(2);
            state.cy.json(state.json);
            state.cy.on("free", function(event) {
                state.json = state.cy.json();
            });
        },
        addNode(state, label) {
            if (!state.tree) throw "Tree not initialized"; //tree hasn't been initialized yet, so we error
            if (!state.cy) throw "Cytoscape not initialized";
			pushUndo(state);
            let id = state.currentId++;
            let node = new Node(id, label);
            state.tree.addNode(node);

            let added = state.cy.add({
                group: "nodes",
                data: {
                    id: id,
                    label: label
                }
            });
            state.json = state.cy.json();
            return id; //return id to be used for cytoscape
        },
        updateNode(state, payload) {
			pushUndo(state);
            state.tree.updateNode(payload.id, payload.label);
            state.cy.$("#" + payload.id).data({
                label: payload.label
            });
            state.json = state.cy.json();
        },
        addEdge(state, pos) {
            let source = pos.source;
            let target = pos.target;
            if (!state.tree) throw "Tree not initialized";
            if (!state.cy) throw "Cytoscape not initialized";
			pushUndo(state);
            let id = pos.source + "-" + pos.target;
            let edge = new Edge(id, source, target);
            state.tree.addEdge(edge);

            state.cy.add({
                group: "edges",
                data: {
                    id: id,
                    source: source,
                    target: target
                }
            });
            state.json = state.cy.json();
            return id;
        },
        deleteNode(state, id) {
            if (!state.tree) throw "Tree not initialized";
			pushUndo(state);
            state.tree.deleteNode(id);
            let removed = state.cy.remove("#" + id);
            state.json = state.cy.json();
        },
        layout(state) {
            state.cy.layout({
                name: 'preset',
                animate: true
            }).run();
            state.json = state.cy.json();
        },
        addSelectListener(state, payload) {
            let listener = payload.listener;
            state.cy.on('select', 'node', (evt) => {
                listener(evt.target.id());
            });
        },
        addDeselectListener(state, payload) {
            let listener = payload.listener;
            state.cy.on('unselect', 'node', (evt) => {
                listener(evt.target.id());
            });
        },
        clean(state) {
            state.tree.clean();
			state.cy.elements().remove();
            state.currentId = 0;
			state.treeUndoStack.length = 0;
			state.treeRedoStack.length = 0;
			state.jsonUndoStack.length = 0;
			state.jsonRedoStack.length = 0;
        },

        undo(state) {
            //state.ur.undo();
            if (state.jsonUndoStack.length == 0) return;
            let json = state.jsonUndoStack.pop();
            state.jsonRedoStack.push(state.cy.json());
            state.cy.json(json);
            state.json = state.cy.json();
			if(state.treeUndoStack.length == 0) return;
			let tree = state.treeUndoStack.pop();
			state.treeRedoStack.push(state.tree.clone());
			state.tree = tree;
        },

        redo(state) {
            //state.ur.redo();
            if (state.jsonRedoStack.length == 0) return;
            let json = state.jsonRedoStack.pop();
            state.jsonUndoStack.push(state.cy.json());
            state.cy.json(json);
            state.json = state.cy.json();
			if(state.treeRedoStack.length == 0) return;
			let tree = state.treeRedoStack.pop();
			state.treeUndoStack.push(state.tree.clone());
			state.tree = tree;
        }
    },
    plugins: [persistentState({
        reducer: state => ({
            tree: state.tree,
            treeNodes: state.tree.nodes,
            treeEdges: state.tree.edges,
            currentId: state.currentId,
            jsonUndoStack: state.jsonUndoStack,
            jsonRedoStack: state.jsonRedoStack,
            json: state.json,
            treeUndoStack: state.treeUndoStack,
            treeRedoStack: state.treeRedoStack
        }),
    })],
});

function pushUndo(state) {
	let tree = state.tree.clone();
	state.treeUndoStack.push(tree);
	let json = state.cy.json();
	state.jsonUndoStack.push(json);

	state.jsonRedoStack.length = 0;
	state.treeRedoStack.length = 0;
}
