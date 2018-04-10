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
	},
	methods:
	{
		addNodeWrapper: function(value)
		{
			tree.addNode();
		}
	}
}
</script>
