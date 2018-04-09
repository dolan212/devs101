<template>
	<div id="cy" ref="cy"style="height:100%; width:100%">
	</div>
</template>

<script>
import * as tree from '@/tree'
export default {
	data() {
		return {
		}
	},
	mounted()
	 {
		tree.initialize(this.$refs.cy);
		tree.addNode();
		tree.addNode();
		tree.addNode();
		tree.addNode();
		tree.addEdge(tree.tree.nodes[0].id, tree.tree.nodes[1].id);
		tree.addEdge(tree.tree.nodes[1].id, tree.tree.nodes[3].id);
		tree.randomLayout();
	},
	methods:
	{
		addNodeWrapper: function(value)
		{
			tree.addNode();
			tree.randomLayout();
		}
	}
}
</script>
