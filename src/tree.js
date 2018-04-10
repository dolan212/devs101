import cytoscape from 'cytoscape'

var cy;

export var tree = {
	nodes: [],
	edges: []
};
var currentId = 0;
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
export function addNode(label)
{
	var id = currentId++;
	var node = { id: id, label: label.trim() };
	tree.nodes.push(node),
	cy.add({
			group: "nodes",
			data: node 
	});

	var out = "";
	for(var i = 0; i < tree.nodes.length; i++)
		out += "(" + tree.nodes[i].id + "," + tree.nodes[i].label + ")";
	return out;
}

export function randomLayout()
{
	cy.layout({
			name: 'random',
			animate: true
	}).run();
}
export function coseLayout()
{
	cy.layout({
			name: 'cose',
			animate: true
	}).run();
}
export function presetLayout()
{
	cy.layout({
			name: 'preset',
			animate: true
	}).run();
}
export function addEdge(from , to)
{
	var id = from + "" + to;
	tree.edges.push({ id: id, source: from, target: to });
	cy.add({
			group: "edges",
			data: { id: id, source: from, target: to }
	});
}

export function clean()
{
	cy.destroy();
	tree.length = 0;
	currentId = 0;
}
