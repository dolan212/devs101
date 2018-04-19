import * as tree from '@/tree'
import * as utils from '@/utils/utils'

describe('tree.js', () => {
  	it('should throw an appropriate error when not initialized', () => {
		expect(() => {
			tree.addNode('anything')
		}).toThrow('Tree not initialized');

	})
	it('should add nodes without error', () => {
		tree.initialize();
		expect(() => {
			tree.addNode('also anything')
		}).not.toThrow();
		tree.clean(); //clean up
	})
	it('should add nodes correctly', () => {
		tree.initialize();
		for(var i = 0; i < 100; i++) {
			let label = utils.randomString();
			expect(
				tree.addNode(label)
			).toBe(i);
			expect(
				tree.getLabel(i)
			).toBe(label);
		}
	})
	it('should throw an appropriate error when a node is not found', () => {
		expect(() => {
			tree.getLabel(1000);
		}).toThrow('Node not found');
	})
	it('should clean up properly', () => {
		tree.clean();
		expect(() => {
			tree.getLabel(0);
		}).toThrow('Node not found');
		expect(tree.addNode('test')).toEqual(0);
		tree.clean();
	})
})
