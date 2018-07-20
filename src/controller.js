import {
    store
} from './store/index.js'
import {
    Tree,
    Node,
    Edge
} from '@/tree'

export function addNode(label) {
    try {
        store.commit('addNode', label);
        //view.addNode(id, label);
        store.commit('layout'); //view.layout();
    } catch (exception) {
        alert(exception);
    }
}

export function addEdge(source, target) {
    try {
        if (source == target)
            return;
        let pos = {
            source: source,
            target: target
        };
        store.commit('addEdge', pos);
        store.commit('layout');
    } catch (exception) {
        alert(exception);
    }
}

export function getNodes() {
    return store.getters.getNodes;
}

export function addRule(skill) {
    try {
        store.commit('addRule', {skill: skill});
    } catch (exception) {
        alert(exception);
    }
}

let selectedNodes = [];

function onSelect(id) {
    selectedNodes.push(id);
}

function onDeselect(id) {
    var i = selectedNodes.indexOf(id);
    if (i != -1) selectedNodes.splice(i, 1);
}

export function deleteSelectedNodes() {
	var temp = [];
    for (var i = 0; i < selectedNodes.length; i++)
	{
        deleteNode(selectedNodes[i]);
		temp.push(selectedNodes[i]);
	}
	for(var i in temp) {
		onDeselect(temp[i]);
	}
}

export function updateDependencies(id) {
	try {
		store.commit('updateDependencies', id);
	} catch(exception) {
		alert(exception);
	}
}

export function getSelectedNodes() {
    return selectedNodes;
}

export function getRules(id) {
	return store.getters.getRules;
}

export function updateNode(id, payload) {
    try {
        let p = {
            id: id,
            label: payload.label
        }
        store.commit('updateNode', p);
    } catch (exception) {
        alert(exception);
    }

}

export function deleteNode(id) {
    try {
        store.commit('deleteNode', id);
    } catch (exception) {
        alert(exception);
    }
}
export function updateDisplay() {
	try {
		store.commit('updateDisplay');
	} catch (exception) {
		alert(exception);
	}
}
export function setupView(container) {
    store.commit('init', container);
    store.commit({
        type: 'addSelectListener',
        listener: onSelect
    });
    store.commit({
        type: 'addDeselectListener',
        listener: onDeselect
    });
}

export function undo() {
    store.commit('undo');
}
export function redo() {
    store.commit('redo');
}

export function clear() {
	store.commit('clean');
}

export function autoLayout() {
	store.commit('autoLayout');
}

export function buildFromJson(jsonData){
    let val = String(jsonData);
    console.log(jsonData);
}

export function getTreeAsJson(){
  var tree =store.getters.getTree;
  tree = '"tree": '+JSON.stringify(tree);
  var globals = store.getters.getGlobals;
  globals = '"globals": '+JSON.stringify(globals);
  var cyt = store.getters.getCytoscapeJson;
  cyt = '"cytoscape": '+JSON.stringify(cyt);

  var finalJson = "{\n"+tree+",\n"+globals+",\n"+cyt+"\n}"
  return finalJson;
}

export function saveJsonDocument(filename, data){
  var blob = new Blob([data],{type: "application/json"});
  var url  = URL.createObjectURL(blob);
  var a = document.createElement('a');

  a.href = url;
  a.download = filename+".json";
  a.textContent = "Download backup.json";

  a.click();
}

export function setupFromJson(jsonString){
  try{
    var tree = JSON.parse(jsonString);

    var t = buildTreeFromJsonObject(tree.tree);
    var g = tree.globals;
    var c = tree.cytoscape;
    store.commit('setTree',t);
    console.log(tree.cytoscape);
    store.commit('setGlobals',g);
    store.commit('setCytoscapeJson',c);
  }catch(e){
    alert("The json file is not valid");
    console.log(e);
  }
}

function buildTreeFromJsonObject(obj){
  var tree = new Tree();
  for(var n in obj.nodes){
    if (obj.nodes.hasOwnProperty(n)) {
      var newNode = new Node(obj.nodes[n]._id,obj.nodes[n]._label,obj.nodes[n]._description);
      tree.addNode(newNode);
    }
  }
  for(var v in obj.edges){
    if (obj.edges.hasOwnProperty(v)) {
      var newEdge = new Edge(obj.edges[v]._id,obj.edges[v]._source,obj.edges[v]._target);
      tree.addNode(newEdge);
      console.log(newEdge);
    }
  }
  return tree;
}
