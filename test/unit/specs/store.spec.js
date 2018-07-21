import {
    store
} from '@/store/index'
import * as utils from '@/utils/utils'

function addNode(label, colour = "#000000") {
    store.commit('addNode', {
        label: label,
        colour: colour
    });
}

describe('store/index.js', () => {
    it('should throw an appropriate error when not initialized', () => {
        expect(() => {
            addNode("test");
        }).toThrow('Tree not initialized');
        expect(() => {
            store.commit('')
        })

    })
    it('should initialize without error', () => {
        expect(() => {
            let container = document.createElement('div');
            store.commit('init', {
                container: container,
                moveListener: null
            })
        }).not.toThrow();
    })
    it('should add nodes without error', () => {
        expect(() => {
            store.commit('addNode', {
                label: 'also anything',
                colour: "#000000"
            })
        }).not.toThrow();
        store.commit('clean') //clean up
    })
    it('should add nodes correctly', () => {
        let container = document.createElement('div');
        store.commit('init', container);
        for (var i = 0; i < 100; i++) {
            let label = utils.randomString();
            expect(() => {
                store.commit("addNode", {
                    label: label,
                    colour: "red"
                })
            }).not.toThrow();
            expect(
                store.getters.getNodeLabel(i)
            ).toBe(label);
        }
    })
    it('should throw an appropriate error when a node is not found', () => {
        expect(() => {
            store.getters.getNodeLabel(1000)
        }).toThrow('Node not found');
    })
    it('should clean up properly', () => {
        store.commit('clean');
        expect(() => {
            store.getters.getNodeLabel(0)
        }).toThrow('Node not found');
        store.commit('clean');
    })
})
