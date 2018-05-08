<template>
	<div @keyup.delete="deleteNodes" id="cy" ref="cy"style="height:100%; width:100%">
	</div>
</template>

<script>
import * as controller from '@/controller'
export default {
	data() {
		return {
		}
	},
	mounted() {
		controller.initialize();
		controller.setupView(this.$refs.cy);
	},
	methods: {
		addNodeWrapper: function(value) {
			tree.addNode();
		},
		deleteNodes: () => {
			controller.deleteSelectedNodes();
		}
	}
}
</script>
