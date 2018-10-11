import Vue from 'vue';
import Vuex from 'vuex';
import persistentState from "vuex-persistedstate"
import {
    Tree,
    Node,
    Edge
} from '@/tree'
import * as rules from '@/rules'
import * as controller from '@/controller'
import cytoscape from 'cytoscape'
import undoredo from 'cytoscape-undo-redo'
import Global from '@/globalVars'
import {
	DependencyRule,
	LevelRule,
	SkillPointRule,
    FunctionRule,
} from '@/rules'

Vue.use(Vuex);

export const cytoscapeNotInitializedError = "Cytoscape not initialized";
export const treeNotInitializedError = "Tree not initialized";
export const globalVarNotFoundError = "Global var not found";
export const globalVarExistsError = "Global var already exists";
export const invalidColourError = "Invalid colour given";

export const store = new Vuex.Store({
    state: {
        tree: null,
        currentId: 0,
        currentRuleId: 0,
        cy: null,
        treeUndoStack: [],
        jsonUndoStack: [],
        treeRedoStack: [],
        jsonRedoStack: [],
        json: "",
        globals: {},
        defaultColour: "#E91E63",
        firstStart: true,

    },
    getters: {
        firstStart(state) {
            return state.firstStart;
        },
        getNodeLabel(state) {
            return id => state.tree.getNode(id).label;
        },
        getNodes(state) {
            return state.tree.getNodes();
        },
        getGlobals(state) {
            return state.globals;
        },
        getGlobal(state) {
            return name => state.globals[name];
        },
        getRules(state) {
            return id => state.tree.getRules(id);
        },
        getTree(state) {
            return state.tree;
        },
        getCytoscapeJson(state) {
            return state.json;
        },
		getJson(state) {
			var json = {
				cytoscape: state.cy.json(),
				tree: state.tree,
				globals: state.globals,
                currentNodeId: state.currentId,
                currentRuleId: state.currentRuleId,
			};
			return json;
		},
    },

    mutations: {
        unsetFirstStart(state) {
            state.firstStart = false;
        },
        setCurrentNodeId(state, id) {
            state.currentId = id;
        },
        setCurrentRuleId(state, id) {
            state.currentRuleId = id;
        },
        init(state, payload) {
            state.tree = new Tree();
            if (state.treeNodes) state.tree.nodes = Array.from(state.treeNodes, x => {
                let n = new Node(x._id, x._label, x._colour);
                n.description = x._description;
                n.max_times = x.max_times;
                if (x.rules !== undefined) {
					n.rules = Array.from(x.rules, r => {
							switch(r.type) {
								case 'dependency':
									return new DependencyRule(r.id, r.node);
								case 'level':
									return new LevelRule(r.id, r.level);
								case 'skillpoint':
									return new SkillPointRule(r.id, r.skillpoints);
                                case 'function':
                                    let funcRule = new FunctionRule(r.id, r.func);
                                    if(r.actual_func) funcRule.actual_func = r.actual_func;
                                    return funcRule;
							}
					});
				}
                return n;
            });
            if (state.treeEdges) state.tree.edges = Array.from(state.treeEdges, x => new Edge(x._id, x._source, x._target));
            state.cy = cytoscape({
                container: payload.container,
                elements: [],
                style: [{
                        selector: 'node',
                        style: {
                            'background-color': state.defaultColour,
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
            state.cy.fit();
            state.cy.json(state.json);
            state.cy.elements().unselect();
            state.cy.nodes().forEach(function(ele) {
                ele.style("background-color", ele.data('background-color'));
            });
            state.cy.$("*").on('position', payload.moveListener);
        },
        addNode(state, payload) {
            checkInitialization(state);
            pushUndo(state);
            let label = payload.label;
            let id = state.currentId++;
            let node = new Node(id, label, state.defaultColour);
            state.tree.addNode(node);

            let added = state.cy.add({
                group: "nodes",
                data: {
                    id: id,
                    label: label,
                }
            });
            added.on('position', payload.moveListener);
            state.json = state.cy.json();
            return id; //return id to be used for cytoscape
        },
        updateNode(state, payload) {
            checkInitialization(state);
            pushUndo(state);
			if(!testColour(payload.colour)) throw invalidColourError;
            if (payload.colour == 'default') payload.colour = state.defaultColour;
            state.tree.updateNode(payload.id, payload.label, payload.colour, payload.description, payload.max_times);
            state.cy.$("#" + payload.id).data({
                label: payload.label
            });
            state.cy.$("#" + payload.id).style('background-color', payload.colour);
            state.cy.$("#" + payload.id).data('background-color', payload.colour);
            state.json = state.cy.json();
        },
        refreshCytoscape(state) {
			if(!state.cy) throw cytoscapeNotInitializedError;
            pushUndo(state);
            state.json = state.cy.json();
        },
        updateDisplay(state) {
            checkInitialization(state);
            let nodes = state.tree.getNodes();
            for (var i in nodes) {
                let n = nodes[i];
                let data = state.cy.$("#" + n.id).data();
                data.label = n.label;
                state.cy.$("#" + n.id).data(data);
            }
        },
        deleteRule(state, payload) {
			if(!state.tree) throw treeNotInitializedError;
            pushUndo(state);
            let skill = payload.skill;
            let rule = payload.rule;
            state.tree.deleteRule(skill, rule);
        },
        moveNode(state, payload) {
			if(!state.cy) throw cytoscapeNotInitializedError;
            let id = payload.id;
            state.cy.$(`#${id}`).position(payload.pos);
        },
        addEdge(state, pos) {
            checkInitialization(state);
            let source = pos.source;
            let target = pos.target;
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
            checkInitialization(state);
            pushUndo(state);
            state.tree.deleteNode(id);
            let removed = state.cy.remove("#" + id);
            state.json = state.cy.json();
        },
        deleteEdge(state, id) {
            checkInitialization(state);
            pushUndo(state);
            state.tree.deleteEdge(id);
            let removed = state.cy.remove("#" + id);
            state.json = state.cy.json();
        },
        updateDependencies(state, id) {
            checkInitialization(state);
            let edges = state.tree.getEdgesPointingTo(id);
            for (var i in edges) {
                state.tree.deleteEdge(edges[i].id);
                state.cy.remove("#" + edges[i].id);
            }
            let node = state.tree.getNode(id);
            for (var i in node.rules) {
                if (node.rules[i].type == "dependency" && node.rules[i].node !== undefined && node.rules[i].node !== null) {
                    let source = node.rules[i].node;
                    let target = node.id;

                    let id = source + "-" + target;
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
                }
            }
        },
        layout(state, payload) {
            if (!state.cy) throw cytoscapeNotInitializedError;
            state.cy.layout({
                name: 'preset',
                animate: payload.animate
            }).run();
            state.json = state.cy.json();
        },
        autoLayout(state, payload) {
            if (!state.cy) throw cytoscapeNotInitializedError;
            pushUndo(state);
            state.cy.layout({
                name: 'breadthfirst',
                animate: payload.animate,
                fit: true,
                directed: true,
                nodeDimensionsIncludeLabels: true,
                padding: 10,
                spacingFactor: 0.8,
                stop: function() {
                    saveJson(state);
                }
            }).run();
        },
        addSelectListener(state, payload) {
            if (!state.cy) throw cytoscapeNotInitializedError;
            let listener = payload.listener;
            state.cy.on('select', 'node', (evt) => {
                listener(evt.target.id());
            });
        },
        addDeselectListener(state, payload) {
            if (!state.cy) throw cytoscapeNotInitializedError;
            let listener = payload.listener;
            state.cy.on('unselect', 'node', (evt) => {
                listener(evt.target.id());
            });
        },
        addRule(state, payload) {
            checkInitialization(state);
            let skill = payload.skill;
            pushUndo(state);
            let rule = new rules.DependencyRule(state.currentRuleId);
            state.currentRuleId++;
            state.tree.addRule(skill, rule);
        },
        clean(state) {
            checkInitialization(state);
			pushUndo(state);
            state.tree.clean();
            state.cy.elements().remove();
            state.json = "";
            state.currentId = 0;
            state.treeUndoStack.length = 0;
            state.treeRedoStack.length = 0;
            state.jsonUndoStack.length = 0;
            state.jsonRedoStack.length = 0;
        },
        undo(state) {
            checkInitialization(state);
            if (state.jsonUndoStack.length == 0) return;
            let json = state.jsonUndoStack.pop();
            state.jsonRedoStack.push(state.cy.json());
			state.cy.elements().remove();
            state.cy.json(json);
            state.json = state.cy.json();
            if (state.treeUndoStack.length == 0) return;
            let tree = state.treeUndoStack.pop();
            state.treeRedoStack.push(state.tree.clone());
            state.tree = tree;
            state.cy.nodes().forEach((ele) => {
                ele.style('background-color', ele.data('background-color'))
            })
        },
        redo(state) {
            checkInitialization(state);
            if (state.jsonRedoStack.length == 0) return;
            let json = state.jsonRedoStack.pop();
            state.jsonUndoStack.push(state.cy.json());
            state.cy.json(json);
            state.json = state.cy.json();
            if (state.treeRedoStack.length == 0) return;
            let tree = state.treeRedoStack.pop();
            state.treeUndoStack.push(state.tree.clone());
            state.tree = tree;
            state.cy.nodes().forEach((ele) => {
                ele.style('background-color', ele.data('background-color'))
            })
        },
        addGlobalVar(state, globalVar) {
			if (state.globals[globalVar.name] !== null && state.globals[globalVar.name] !== undefined) throw globalVarExistsError;
            state.globals[globalVar.name] = globalVar;
        },

        deleteGlovalVar(state, globalVarName) {
            if (state.globals[globalVarName] === null || state.globals[globalVarName === undefined]) throw globalVarNotFoundError;
            state.globals[globalVarName] = null;
        },
        setTree(state, payload) {
            if (payload == null) return;
            state.tree = payload;
        },
        setGlobals(state, payload) {
            if (payload == null) return;
            state.globals = payload;
        },
        setCytoscapeJson(state, payload) {
            if (!state.cy) throw cytoscapeNotInitializedError;
            if (payload == null) return;
            state.json = payload.json;
            state.cy.json(payload.json);
            state.cy.nodes().forEach(function(ele) {
                ele.style("background-color", ele.data('background-color'));
            });
            state.cy.$("*").on('position', payload.moveListener);
            state.cy.elements().unselect();
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
            json: state.cy.json(),
            treeUndoStack: state.treeUndoStack,
            treeRedoStack: state.treeRedoStack,
            globals: state.globals,
            firstStart: state.firstStart,
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

function saveJson(state) {
    state.json = state.cy.json();
}
function checkInitialization(state) {
    if (!state.tree) throw treeNotInitializedError; //tree hasn't been initialized yet, so we error
    if (!state.cy) throw cytoscapeNotInitializedError;
}
function testColour(colour) {
	var div = document.createElement('div');
	div.style.borderColor = "";
	div.style.borderColor = colour;
	var col2 = div.style.borderColor;
	if(col2.length == 0) return false;
	else return true;
}
