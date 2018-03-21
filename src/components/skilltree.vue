<template>
	<v-container fill-height absolute pb-5 pt-0>
		<v-container id="cy" ref="cy"style="height:100%; width:100%">
		</v-container>
	</v-container>
</template>

<script>
import * as tree from '@/tree'
import * as app from '@/App'
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
