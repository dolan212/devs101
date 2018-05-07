import * as tree from '@/tree'
import * as view from '@/view'
import {store} from './store/index.js'

export function initialize()
{

	tree.initialize();
}

export function addNode(label) {
	try {
		let id = tree.addNode(label);
		store.commit('addNode',label);
		//view.addNode(id, label);
		store.commit('layout');//view.layout();
	}
	catch(exception) {
		alert(exception);
	}
}

export function addEdge(source, target) {
	try {
		let id = tree.addEdge(source, destination);
		store.commit('addEdge',source,destination);
		store.commit('layout')
	}
	catch(exception) {
		alert(exception);
	}
}

let selectedNodes = [];
function onSelect(id) {
	selectedNodes.push(id);
}
function onDeselect(id) {
	var i = selectedNodes.indexOf(id);
	if(i != -1) selectedNodes.splice(i, 1);
}

export function deleteSelectedNodes() {
	for(var i = 0; i < selectedNodes.length; i++)
		deleteNode(selectedNodes[i]);
}

function deleteNode(id) {
	try {
		tree.deleteNode(id);
		view.deleteNode(id);
	}
	catch(exception) {
		alert(exception);
	}
}
export function setupView(container) {
	//view.initialize(container); //initialize the cytoscape using the specified container
	store.commit('init',container);
	//view.addSelectListener(onSelect);
	//view.addDeselectListener(onDeselect);
}
