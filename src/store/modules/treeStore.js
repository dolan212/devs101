import {Tree,Node,Edge} from '@/tree'
import * as controller from '@/controller'
import cytoscape from 'cytoscape'
import undoredo from 'cytoscape-undo-redo'

cytoscape.use(undoredo);

const state =
{
  tree: null,
  currentId: 0,
  cy: null,
  ur: null,
  treeUndoStack: [],
  jsonUndoStack: [],
  treeRedoStack: [],
  jsonRedoStack: []

}
const getters =
{
	getNodeLabel(state) {
		return id => state.tree.getNode(id).label;
	},
	getNodes(state) {
		return state.tree.getNodes();
	}
}

// actions
const actions =
{

}

const mutations =
{
  init(state,container)
  {
	  state.tree = new Tree();
    state.cy = cytoscape({
  			container: container,
  			elements: [],
  			style: [
  				{
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
  						'target-arrow-shape': 'triangle'
  					}
  				}
  			],
  			layout: {
  				name: 'random',
  			}
  	});
  	state.cy.maxZoom(2);
    state.ur = state.cy.undoRedo();
  },
  addNode(state,label)
  {
    if(!state.tree) throw "Tree not initialized"; //tree hasn't been initialized yet, so we error
    state.treeUndoStack.push(state.tree);
    let id = state.currentId++;
    let node = new Node(id, label);
    state.tree.addNode(node);

    if(!state.cy) throw "Cytoscape not initialized";
    state.jsonUndoStack.push(state.cy.json());
  	let added=state.cy.add({
  		group: "nodes",
  		data: { id: id, label: label }
  	});
    state.ur.do("add",added);
    console.log(state.cy.nodes().json());
    return id; //return id to be used for cytoscape
  },
  addEdge(state, pos)
  {
    let source = pos.source;
    let target = pos.target;
    if(source == target) return;
    if(!state.tree) throw "Tree not initialized";
    let id = pos.source + "-" + pos.target;
    let edge = new Edge(id, source, target);
    state.tree.addEdge(edge);

    if(!state.cy) throw "Cytoscape not initialized";
    state.cy.add({
      group: "edges",
  		data: {id: id, source: source, target: target}
    });

    return id;
  },
  getNodes() {
    if(state.cy == null)
      return null;
    else
      return state.cy.nodes().json();
  },
  deleteNode(state, id) {
	  if(!state.tree) throw "Tree not initialized";
	  state.treeUndoStack.push(state.tree);
	  state.tree.deleteNode(id);
	  state.jsonUndoStack.push(state.cy.json());
	  let removed=state.cy.remove("#" + id);
    state.ur.do("remove",removed);
  },
  layout(state)
  {
    state.cy.layout({
  		name: 'preset',
  		animate: true
  	}).run();
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
	state.cy.destroy();
	state.currentId = 0;
},

undo(state){
  //state.ur.undo();
  if(state.jsonUndoStack.length == 0) return;
  let json = state.jsonUndoStack.pop();
  state.jsonRedoStack.push(state.cy.json());
  state.cy.json(json);
},

redo(state){
  //state.ur.redo();
  if(state.jsonRedoStack.length == 0) return;
  let json = state.jsonRedoStack.pop();
  state.jsonUndoStack.push(state.cy.json());
  state.cy.json(json);
}
}
const watch = {
  cy:{
    handler: function (newItem)
    {
      newItem.json(newItem.json());
    },
    deep:true
  }
}



export default
{
  state: state,
  getters: getters,
  actions: actions,
  mutations: mutations,
  watch: watch
}
