<template>
  <v-app>
    <v-navigation-drawer
      persistent
      v-model="drawer"
      enable-resize-watcher
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
	
	<!--  adding nav bar to be placed to the right of the navigation side bar -->
	
		  
  <!-- closing nav bar  -->
  
    <v-toolbar
      app
      :clipped-left="clipped"
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-btn @click.stop="undo" flat small><v-icon>undo</v-icon></v-btn>
      <v-btn @click.stop="redo" flat small><v-icon>redo</v-icon></v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
	  <v-btn icon @click.stop="settingsDrawer = !settingsDrawer">
	  	<v-icon>settings</v-icon>
	  </v-btn>
    </v-toolbar>
      <v-content>
        <router-view/>
      </v-content>
	<!-- Global settings drawer -->
	<v-navigation-drawer
		temporary
		:right="true"
		v-model="settingsDrawer"
		app
	>
		<v-toolbar flat>
			<v-list>
				<v-list-tile>
					<v-list-tile-content>
						<v-list-tile-title>Settings</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list>
		</v-toolbar>
	</v-navigation-drawer>
	
	<!-- Node settings drawer -->
	<v-navigation-drawer
	temporary
	:right="true"
	v-model="nodeDrawer" 
	app
	>
		<v-toolbar flat>
			<v-list>
				<v-list-tile>
					<v-list-tile-content>
						<v-list-tile-title>Editing: {{ selectedNode.label }}</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list>
		</v-toolbar>
		<v-divider></v-divider>
		<v-container fluid>
					<v-text-field label="Skill Name" v-model="selectedNode.label"></v-text-field>
					<v-text-field label="Node Colour" v-model="selectedNode.colour"></v-text-field>
		</v-container>
	</v-navigation-drawer>

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
		  @click.native.stop="editNode()"
		>
		  <v-icon>edit</v-icon>
		</v-btn>
		<v-btn
		  fab
		  dark
		  small
		  color="red"
		  @click.native.stop="deleteNodes()"
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
          <v-btn color="blue darken-1" flat @click.native="dialog = false" v-on:click="addNode(nodeName)" >Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2018 devs101</span>
    </v-footer>
  </v-app>
</template>

<script>
import * as controller from '@/controller'

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
	data () {
		return {
			clipped: true,
      			drawer: false,
				nodeDrawer: false,
				settingsDrawer: false,
			miniVariant: false,
      			fixed: false,
			nodeName: "",
		      	items: [
				{ icon: 'bubble_chart', title: 'Edit Tree' },
				{ icon: 'import_export', title: 'Import Tree' },
				{ icon: 'info', title: 'About' }
			],
			title: 'Trii',
			hov:false,
			fab:false,
			editDirection:'top',
			isVisible:true,
			dialog:false,
			selectedNode: { id: 0, label: 'example', colour: '#AAAAAA' } //just some example data
			
			
		}
	},
	name: 'Trii',
	methods: {
		addNode: function(nodeLabel) {
			console.log(this.nodeName);
			controller.addNode(nodeLabel);
			this.nodeName = "";
		},
    addEdge: function(source, target) {
      controller.addEdge(source, target);
    },
		deleteNodes: () => {
			controller.deleteSelectedNodes();
		},
		undo: function() {
			controller.undo();
		},
		redo: function() {
			controller.redo();
		},
		editNode: function() {
			console.log(this.nodeDrawer);
			this.nodeDrawer = true;
		},
		editSettings: function() {
			this.settingsDrawer = true;
		}
	}
}
</script>
