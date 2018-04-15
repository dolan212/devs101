import cytoscape from 'cytoscape'

var cy;
export function initialize(container)
{
	cy = cytoscape({
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
	cy.maxZoom(2);
}


export function addNode(id, label) {
	if(!cy) throw "Cytoscape not initialized";
	cy.add({
		group: "nodes",
		data: { id: id, label: label }
	});
}

export function getLabel(id) {
	if(!cy) throw "Cytoscape not initialized";
	let el = cy.$id(id);
	if(!el) throw "Unknown element";
	return el.label;
}

export function clean() {
	cy.destroy();
}

export function layout() {
	cy.layout({
		name: 'preset',
		animate: true
	}).run();
}
