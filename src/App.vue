<template>
  <v-app>
    <v-navigation-drawer
      persistent
      :mini-variant="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      enable-resize-watcher
      fixed
      app
    >
      <v-list>
        <v-list-tile
          value="false"
          v-for="(item, i) in items"
          :key="i"
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      app
      :clipped-left="clipped"
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
      <v-content>
        <router-view/>
      </v-content>
      <v-fab-transition>
	      <v-speed-dial
	      v-model="fab"
	      :direction="editDirection"
	      :open-on-hover="hov"
	      bottom
	      right
	      fixed
	      v-show="['skilltree'].indexOf($route.name) > -1"
	      >
		<v-btn
		  slot="activator"
		  color="blue darken-2"
		  dark
		  fab
		  v-model="fab"
		  >
		  <v-icon>keyboard_arrow_up</v-icon>
		  <v-icon>close</v-icon>
		</v-btn>
		<v-btn
		  fab
		  dark
		  small
		  color="green"
       @click.native.stop="dialog = true"
		>
		  <v-icon>add</v-icon>
		</v-btn>
		<v-btn
		  fab
		  dark
		  small
		  color="indigo"
		>
		  <v-icon>edit</v-icon>
		</v-btn>
		<v-btn
		  fab
		  dark
		  small
		  color="red"
		>
		  <v-icon>delete</v-icon>
		</v-btn>
	      </v-speed-dial>
      </v-fab-transition>
      <v-dialog v-model="dialog" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline" center>New Node</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm12 md12>
                <v-text-field label="Node name" v-model="nodeName"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click.native="dialog = false" v-on:click="addIndirectNode(nodeName)" >Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2018 devs101</span>
    </v-footer>
  </v-app>
</template>

<script>
import * as tree from '@/tree'

export default {
  computed: {
      activeFab () {
        switch (this.tabs) {
          case 'one': return { 'class': 'purple', icon: 'account_circle' }
          case 'two': return { 'class': 'red', icon: 'edit' }
          case 'three': return { 'class': 'green', icon: 'keyboard_arrow_up' }
          default: return {}
        }
      }
    },
	data ()
  {
    		return {
      			clipped: true,
      			drawer: false,
      			fixed: false,
		      	items: [
				{
					icon: 'bubble_chart',
					title: 'Edit Tree'
				},
				{
					icon: 'import_export',
					title: 'Import Tree'
				},
				{
					icon: 'info',
					title: 'About'
				}


			],

			miniVariant: false,
			right: true,
			rightDrawer: false,
			title: 'Trii',

      hov:false,
      fab:false,
      editDirection:'top',
      isVisible:true,

      dialog:false,

		}
	},
	name: 'Trii',
  methods:
  {
    addIndirectNode: function(nodeLabel)
    {
      tree.addNode(nodeLabel);
      tree.presetLayout();
      nodeLabel:""
    }
  }

}

</script>
