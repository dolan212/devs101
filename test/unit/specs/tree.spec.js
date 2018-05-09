import {store} from '@/store/index'
import * as utils from '@/utils/utils'

describe('treeStore.js', () => {
  	it('should throw an appropriate error when not initialized', () => {
		expect(() => {
			store.commit('addNode', "something");
		}).toThrow('Tree not initialized');

	})
	it('should add nodes without error', () => {
		let container = document.createElement('div');
		store.commit('init', container)
		expect(() => {
			store.commit('addNode', 'also anything')
		}).not.toThrow();
		store.commit('clean') //clean up
	})
	it('should add nodes correctly', () => {
		let container = document.createElement('div');
		store.commit('init', container);
		for(var i = 0; i < 100; i++) {
			let label = utils.randomString();
			expect(() => {
				store.commit("addNode", label)
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
