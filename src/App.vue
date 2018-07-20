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

      <v-tooltip bottom>
        <v-btn slot="activator" @click.stop="undo" icon>
          <v-icon>undo</v-icon>
        </v-btn>
        <span>Undo</span>
      </v-tooltip>

      <v-tooltip bottom>
        <v-btn slot="activator" @click.stop="redo" icon>
          <v-icon>redo</v-icon>
        </v-btn>
        <span>Redo</span>
      </v-tooltip>

      <v-tooltip bottom>
        <v-btn icon slot="activator"fab small @keydown.ctrl.67="copy()" @click.native.stop="copy()" >
          <v-icon>file_copy</v-icon>
        </v-btn>
        <span>Copy</span>
      </v-tooltip>

      <v-tooltip bottom>
        <v-btn icon slot="activator"fab small @keydown.ctrl.86="paste()" @click.native.stop="paste()" >
          <v-icon>archive</v-icon>
        </v-btn>
        <span>Paste</span>
      </v-tooltip>

      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
	  <v-tooltip bottom>
		  <v-btn slot="activator" icon small @click.stop="settingsDrawer = !settingsDrawer">
			<v-icon>settings</v-icon>
		  </v-btn>
		  <span>Settings</span>
	  </v-tooltip>

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
      <v-tooltip left>
			    <v-btn slot="activator" flat v-on:click="newTree">Clear Tree</v-btn>
        <span>Delete all nodes</span>
      </v-tooltip>
      <v-tooltip left>
        <v-btn slot="activator" flat @click.native.stop="autoLayout()">Auto Layout</v-btn>
        <span>Automatically orders nodes</span>
      </v-tooltip>
		</v-container>
    <v-container fluid>
      <p>Import Skill Tree</p>
			<input type="file" accept=".json" @change="onFileChange">
      <v-tooltip left>
        <v-btn slot="activator" flat @click.native.stop="fileDialog = true">Export Skill Tree</v-btn>
        <span>Export tree as json file</span>
      </v-tooltip>
		</v-container>
	</v-navigation-drawer>

	<!-- Node settings drawer -->
	<v-navigation-drawer
	:right="true"
	v-model="nodeDrawer"
	app
	temporary
	>
		<v-toolbar flat>
			<v-list>
				<v-list-tile>
					<v-list-tile-content>
						<v-list-tile-title>Edit Skills</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list>
		</v-toolbar>
		<v-divider></v-divider>
		<v-container grid-list-md text-xs-center v-for="item in nodes" :key="item.id" v-if="item.selected">
			<v-layout row wrap>
				<v-flex xs12>
					<v-subheader>Editing {{ item.label }} </v-subheader>
					<v-card dark>
						<v-container fill-height fluid>
							<v-layout fill-height>
								<v-flex xs12 align-end flexbox>
									<v-text-field label="Skill Name" v-model="item.label"></v-text-field>
									<v-text-field label="Skill Description" v-model="item.description"></v-text-field>
								</v-flex>
							</v-layout>
						</v-container>
					</v-card>
				</v-flex>

				<v-subheader>Skill Rules</v-subheader>
				<v-flex xs12 v-for="rule in item.rules" :key="rule.id">
					<v-card dark>
						<v-container fill-height fluid>
							<v-layout fill-height>
								<v-flex xs12 align-end flexbox>
									<v-select
										v-model="rule.type"
										:items="rule_types"
										item-text="name"
										item-value="value"
									></v-select>
									<v-select
										v-if="rule.type == 'dependency'"
										v-model="rule.node"
										:items="nodes"
										item-text="label"
										item-value="id"
									></v-select>
									<v-text-field label="Level Requirement"
										v-model="rule.level"
										v-if="rule.type == 'level'"
									></v-text-field>
									<v-text-field
										label="Skill Points Required"
										v-model="rule.skillpoints"
										v-if="rule.type == 'skillpoint'"
									></v-text-field>
								</v-flex>
							</v-layout>
						</v-container>
					</v-card>
				</v-flex>
				<v-btn v-on:click="addRule(item.id)">Add Rule</v-btn>
			</v-layout>
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

    <v-tooltip left>
      <v-btn
        slot="activator"
  		  fab
  		  dark
  		  small
  		  color="green"
  		  @click.native.stop="dialog = true"
  		>
  		  <v-icon>add</v-icon>
  		</v-btn>
      <span>Add Skill</span>
    </v-tooltip>

    <v-tooltip left>
  		<v-btn
        slot="activator"
  		  fab
  		  dark
  		  small
  		  color="indigo"
  		  @click.native.stop="editNode()"
  		>
  		  <v-icon>edit</v-icon>
  		</v-btn>
    <span>Edit Skill</span>
    </v-tooltip>

    <v-tooltip left>
  		<v-btn
        slot="activator"
  		  fab
  		  dark
  		  small
  		  color="red"
  		  @click.native.stop="deleteNodes()"
  		>
  		  <v-icon>delete</v-icon>
  		</v-btn>
    <span>Delete Skill</span>
    </v-tooltip>

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

  <v-dialog v-model="fileDialog" persistent max-width="500px">
  <v-card>
    <v-card-title>
      <span class="headline" center>File Name</span>
    </v-card-title>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout wrap>
          <v-flex xs10 sm10 md10>
            <v-text-field label="File name" v-model="fileName"></v-text-field>
          </v-flex>
          <v-flex xs2 sm2 md2>
            <br><p>.json</p>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" flat @click.native="fileDialog = false; fileName=''">Close</v-btn>
      <v-btn color="blue darken-1" flat @click.native="fileDialog = false" v-on:click="exportTree(fileName)" >Export</v-btn>
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
				copyName: [],
                fileName:"",
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
				fileDialog: false,
                selectedNode: null,
				rules: [],
				rule_types: [
					{ name: "Dependency", value: "dependency" },
					{ name: "Level", value: "level" },
					{ name: "Skill Point", value: "skillpoint" }
				]


            }
        },
        name: 'Trii',
        methods: {
          exportTree: function(fileLabel) {
            var json = controller.getTreeAsJson();
            controller.saveJsonDocument(fileLabel, json);
            this.fileName="";
          },
          onFileChange: function(e) {
              var files = e.target.files || e.dataTransfer.files;
              var file, fr, results;
              if (!files.length)
                return;
              file=files[0];
              fr = new FileReader();

              fr.onload = function(e){
                results = e.target.result
                controller.setupFromJson(results);
              }

              fr.onError = function(e){
                console.log("An error occured");
              }
              fr.readAsText(file);
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
            copy: function(){
                for(var k = 0; k <= this.copyName.length; k++)
                  this.copyName.splice(0);
                this.getNodes();
                var selectedNodes = controller.getSelectedNodes();
                for (var i = 0; i < this.nodes.length; i++) {
                    let n = this.nodes[i];
                    for (var j = 0; j < selectedNodes.length; j++) {
                        if (n.id == selectedNodes[j]) {
                            this.copyName.push(n.label);
                            break;
                        }
                    }
                }
                console.log(this.copyName);
            },
            paste: function(){
                if(this.copyName.lenth == 0)
                  return;
                else
                {
                  for(var i = 0; i < this.copyName.length; i++)
                  {
                    controller.addNode(this.copyName[i]);
                  }
                }
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
				if(selectedNodes.length == 1) {
					var rules = controller.getRules(selectedNodes[0]);
					this.rules = rules;
				}
				else {
					this.rules = [];
				}
                this.nodeDrawer = true;
            },
			updateDependencies(id) {
				controller.updateDependencies(id);
			},
            saveNodes: function() {
                var selectedNodes = controller.getSelectedNodes();
                let n = this.nodes.filter(x => selectedNodes.includes("" + x.id));
                for (var i = 0; i < n.length; i++) {
                    controller.updateNode(n[i].id, {
                        label: n[i].label
                    });
					this.updateDependencies(n[i].id);
                }
                this.nodeDrawer = false;
            },
			addRule: function(id) {
				controller.addRule(id);
			},
            editSettings: function() {
                this.settingsDrawer = true;
            },
            autoLayout: function() {
                controller.autoLayout();
            },
			newTree: function() {
				controller.clear();
			}
        }
    }
</script>
