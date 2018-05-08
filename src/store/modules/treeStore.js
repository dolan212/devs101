import {Tree,Node} from '@/tree'
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

}
const getters =
{
	getNodeLabel(state) {
		return id => state.tree.getNode(id).label;
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
    let id = state.currentId++;
    let node = new Node(id, label);
    state.tree.addNode(node);

    if(!state.cy) throw "Cytoscape not initialized";
  	let added=state.cy.add({
  		group: "nodes",
  		data: { id: id, label: label }
  	});
    state.ur.do("add",added);

    return id; //return id to be used for cytoscape
  },
  deleteNode(state, id) {
	  if(!state.tree) throw "Tree not initialized";
	  state.tree.deleteNode(id);
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
  state.ur.undo();
},

redo(state){
  state.ur.redo();
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
  state,
  getters,
  actions,
  mutations,
  watch
}
