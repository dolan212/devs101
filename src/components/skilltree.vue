<template>
	<v-container grid-list-md text-xs-center fill-height>
      		<v-layout row wrap fill-height>
			<div id="cy" ref="cy" style="width:100%; height:100%;"></div>
		</v-layout>
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
	}
}
</script>
