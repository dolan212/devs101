import {
    store
} from './store/index.js'

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

export function addRule(skill, rule) {
    try {
        store.commit('addRule', {skill: skill, rule: rule});
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
    for (var i = 0; i < selectedNodes.length; i++)
        deleteNode(selectedNodes[i]);
}

export function getSelectedNodes() {
    return selectedNodes;
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

export function buildFromJson(jsonData){
    let val = String(jsonData);
    console.log(jsonData);
}

export function getTreeAsJson(){
  var tree =store.getters.getTree;
  tree = "tree: "+JSON.stringify(tree);
  var globals = store.getters.getGlobals;
  globals = "globals: "+JSON.stringify(globals);
  var cyt = store.getters.getCytoscapeJson;
  cyt = "cytoscape: "+JSON.stringify(cyt);

  var finalJson = tree+",\n"+globals+",\n"+cyt
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
