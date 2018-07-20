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
            label: payload.label,
			colour: payload.colour
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
