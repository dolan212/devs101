import * as tree from '@/tree'
import * as view from '@/view'

export function initialize() {
	tree.initialize();
}

export function addNode(label) {
	try {
		let id = tree.addNode(label);
		view.addNode(id, label);
		view.layout();
	}
	catch(exception) {
		alert(exception);
	}
}

export function setupView(container) {
	view.initialize(container); //initialize the cytoscape using the specified container
}
