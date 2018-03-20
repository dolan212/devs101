<template>
	<v-container fluid fill-height>
  	<div id="cy" ref="cy" style="width:100%; height:100%;"></div>
	</v-container>
</template>

<script>
import * as tree from '@/tree'
export default {
	data() {
		return {
		}
	},
	mounted() {
		tree.initialize(this.$refs.cy);	
		tree.addNode();
		tree.addNode();
		tree.addNode();
		tree.addNode();
		tree.addEdge(tree.tree.nodes[0].id, tree.tree.nodes[1].id);
		tree.addEdge(tree.tree.nodes[1].id, tree.tree.nodes[3].id);
		tree.randomLayout();
	}
}
</script>
