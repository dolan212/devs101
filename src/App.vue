<template>
  <v-app>
    <v-navigation-drawer
      persistent
      v-model="drawer"
      enable-resize-watcher
	  clipped
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
      clipped-left
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-btn @click.stop="undo" icon><v-icon>undo</v-icon></v-btn>
      <v-btn @click.stop="redo" icon><v-icon>redo</v-icon></v-btn>
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
		<v-container fluid>
			<v-btn flat v-on:click="newTree">Clear Tree</v-btn>
		</v-container>
    <v-container fluid>
			<input type="file" accept=".json" @change="onFileChange">
		</v-container>
	</v-navigation-drawer>

	<!-- Node settings drawer -->
	<v-navigation-drawer
	:right="true"
	v-model="nodeDrawer"
	app
	>
		<v-toolbar flat>
			<v-list>
				<v-list-tile>
					<v-list-tile-content>
						<v-list-tile-title>Edit Nodes</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list>
		</v-toolbar>
		<v-divider></v-divider>
		<v-container v-for="item in nodes" :key="item.id" v-if="item.selected" fluid>
					<v-subheader>{{ item.label }} </v-subheader>
					<v-text-field label="Skill Name" v-model="item.label"></v-text-field>
					<v-divider></v-divider>

					<v-subheader>{{ item.description }} </v-subheader>
					<v-text-field label="Skill Description" v-model="item.description"></v-text-field>
					<v-divider></v-divider>

		</v-container>
		<v-btn v-on:click="saveNodes()">Save</v-btn>
	</v-navigation-drawer>
	<v-snackbar
		:timeout="noSelectionSnack.timeout"
		top
		v-model="noSelectionSnack.enabled"
	>
		{{ noSelectionSnack.text }}
		<v-btn flat color="pink" @click.native="noSelectionSnack.enabled = false">Close</v-btn>
	</v-snackbar>

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
		  color="yellow"
		  @click.stop="dialog2 = true"
      v-on:click= "getNodes()"
		>
		  <v-icon>call_split</v-icon>
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

    <v-dialog v-model="dialog2" persistent max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline" center>New Edge</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12 sm12 md12>
              <v-subheader>Source Node</v-subheader>
            </v-flex>
            <v-flex xs12 sm12 md12>
              <v-select
              :items="nodes"
              v-model="source"
              label="Select"
              single-line
              item-text="label"
              item-value="id"
              return-object
              persistant-hint
              ></v-select>
            </v-flex>
            <v-flex xs12 sm12 md12>
              <v-subheader>Target Node</v-subheader>
            </v-flex>
            <v-flex xs12 sm12 md12>
              <v-select
              :items="nodes"
              v-model="target"
              label="Select"
              single-line
              item-text="label"
              item-value="id"
              return-object
              persistant-hint
              ></v-select>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click.native="dialog2 = false">Close</v-btn>
        <v-btn color="blue darken-1" flat @click.native="dialog2 = false" v-on:click="addEdge(source,target)" >Add</v-btn>
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
    var nodes = null;
    export default {
        computed: {
            activeFab() {
                switch (this.tabs) {
                    case 'one':
                        return {
                            'class': 'purple',
                            icon: 'account_circle'
                        }
                    case 'two':
                        return {
                            'class': 'red',
                            icon: 'edit'
                        }
                    case 'three':
                        return {
                            'class': 'green',
                            icon: 'keyboard_arrow_up'
                        }
                    default:
                        return {}
                }
            }
        },
        data() {
            return {
                clipped: true,
                drawer: false,
                nodeDrawer: false,
                settingsDrawer: false,
                miniVariant: false,
                fixed: false,
                nodeName: "",
                source: null,
                target: null,
                select: {
                    id: '-1',
                    label: 'node'
                },
                items: [{
						icon: 'add',
						title: 'New Tree',
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
                nodes: [],
                noSelectionSnack: {
                    text: "Please select a skill first",
                    timeout: 6000,
                    enabled: false
                },
                title: 'Trii',
                hov: false,
                fab: false,
                editDirection: 'top',
                isVisible: true,
                dialog: false,
                dialog2: false,
                selectedNode: null


            }
        },
        name: 'Trii',
        methods: {
          onFileChange(e) {
              var files = e.target.files || e.dataTransfer.files;
              var file, fr, results;
              if (!files.length)
                return;
              file=files[0];
              fr = new FileReader();

              fr.onload = function(e){
                console.log(fr.result);
                results=fr.results;
              }

              fr.onError = function(e){
                console.log("An error occured");
              }
              fr.readAsText(file);
            },
            buildFromJson(jsonData)
            {

            },
            addNode: function(nodeLabel) {
                controller.addNode(nodeLabel);
                this.nodeName = "";
            },
            addEdge: function(source, target) {
                controller.addEdge(source.id, target.id);
                this.source = null;
                this.target = null;
            },
            getNodes: function() {
                this.nodes = controller.getNodes();
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
                this.getNodes();
                var selectedNodes = controller.getSelectedNodes();
                if (selectedNodes.length == 0) {
                    this.noSelectionSnack.enabled = true;
                    return;
                }
                for (var i = 0; i < this.nodes.length; i++) {
                    let n = this.nodes[i];
                    for (var j = 0; j < selectedNodes.length; j++) {
                        if (n.id == selectedNodes[j]) {
                            this.nodes[i].selected = true;
                            break;
                        }
                        n.selected = false;
                    }
                }
                this.nodeDrawer = true;
            },
            saveNodes: function() {
                var selectedNodes = controller.getSelectedNodes();
                let n = this.nodes.filter(x => selectedNodes.includes("" + x.id));
                for (var i = 0; i < n.length; i++) {
                    controller.updateNode(n[i].id, {
                        label: n[i].label
                    });
                }
                this.nodeDrawer = false;
            },
            editSettings: function() {
                this.settingsDrawer = true;
            },
			      newTree: function() {
				        controller.clear();
			      }
        }
    }
</script>
