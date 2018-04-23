import {Tree,Node} from '@/tree'
import * as controller from '@/controller'
import cytoscape from 'cytoscape'
const state =
{
  tree: new Tree(),
  currentId: 0,
  cy: null
}
const getters =
{
}

// actions
const actions =
{

}

const mutations =
{
  init(state,container)
  {
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
  },
  addNode(state,label)
  {
    console.log("EAT MY ASS");
    if(!state.tree) throw "Tree not initialized"; //tree hasn't been initialized yet, so we error
    let id = state.currentId++;
    let node = new Node(id, label);
    state.tree.addNode(node);

    if(!state.cy) throw "Cytoscape not initialized";
  	state.cy.add({
  		group: "nodes",
  		data: { id: id, label: label }
  	});


    return id; //return id to be used for cytoscape
  },
  layout(state)
  {
    state.cy.layout({
  		name: 'preset',
  		animate: true
  	}).run();
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
