<template>
	<v-container pa-0 fluid fill-height>
  	<div id="cy" ref="cy" style="width:100%; height:100%;"></div>
	</v-container>
</template>

<script>
import cytoscape from 'cytoscape'
export default {
	data() {
		return {
		}
	},
	mounted() {
		var cy = cytoscape({
			container: this.$refs.cy,
			elements: [
				{
					data: { id: 'a' }
				},
				{
					data: { id: 'b' }
				},
				{
					data: { id: 'ab', source: 'a', target: 'b' }
				}

			],
			style: [
				{
					selector: 'node',
					style: {
						'background-color': '#666',
						'label': 'data(id)'
					}
				}
			],
		});
	},
	methods:{
		addNode: function()
		{

		}
	}
}
</script>
