<template>
<v-app>
    <v-navigation-drawer persistent v-model="drawer" enable-resize-watcher clipped app>
        <v-list>
            <v-list-tile value="false" v-for="(item, i) in items" :key="i">
                <v-list-tile-action>
                    <v-icon v-html="item.icon"></v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title v-text="item.title"></v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
        </v-list>
    </v-navigation-drawer>
    <v-toolbar app clipped-left>
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>

        <v-tooltip bottom>
            <v-btn slot="activator" id="btn_undo" @click.stop="undo" icon>
                <v-icon>undo</v-icon>
            </v-btn>
            <span>Undo</span>
        </v-tooltip>

        <v-tooltip bottom>
            <v-btn slot="activator" id="btn_redo" @click.stop="redo" icon>
                <v-icon>redo</v-icon>
            </v-btn>
            <span>Redo</span>
        </v-tooltip>

        <v-tooltip bottom>
            <v-btn icon slot="activator" id="btn_copy" fab small @keydown.ctrl.67="copy()" @click.native.stop="copy()">
                <v-icon>file_copy</v-icon>
            </v-btn>
            <span>Copy</span>
        </v-tooltip>

        <v-tooltip bottom>
            <v-btn icon slot="activator" id="btn_paste" fab small @keydown.ctrl.86="paste()" @click.native.stop="paste()">
                <v-icon>archive</v-icon>
            </v-btn>
            <span>Paste</span>
        </v-tooltip>

        <v-toolbar-title v-text="title"></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip bottom>
            <v-btn slot="activator" id="btn_settings" icon small @click.stop="settingsDrawer = !settingsDrawer">
                <v-icon>settings</v-icon>
            </v-btn>
            <span>Settings</span>
        </v-tooltip>

    </v-toolbar>
    <v-content>
        <router-view/>
    </v-content>
    <!-- Global settings drawer -->
    <v-navigation-drawer id="settings_drawer" temporary :right="true" v-model="settingsDrawer" app>
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
                <v-btn color="info" block slot="activator"  id="btn_clear" v-on:click="newTree">Clear Tree</v-btn>
                <span>Delete all nodes</span>
            </v-tooltip>
            <v-tooltip left>
                <v-btn color="info" block slot="activator"  id="btn_layout" @click.native.stop="autoLayout()">Auto Layout</v-btn>
                <span>Automatically orders nodes</span>
            </v-tooltip>
            <v-tooltip left>
                <v-btn color="info" block slot="activator"  id="btn_layout" @click.native.stop="globFrom = true">Global Variables</v-btn>
                <span>Add Global variables to the tree</span>
            </v-tooltip>
        </v-container>
        <v-container fluid>
          <h2>Import and Export</h2>
            <p>Import Skill Tree</p>
            <input type="file" accept=".json" @change="onFileChange">
            <v-tooltip left>
                <v-btn color="info" block slot="activator" id="btn_export"  @click.native.stop="fileDialog = true">Export Skill Tree</v-btn>
                <span>Export tree as json file</span>
            </v-tooltip>
        </v-container>
        <v-spacer></v-spacer>
        <v-btn color="error" id="btn_close_settings" @click="settingsDrawer = !settingsDrawer">Close</v-btn>
    </v-navigation-drawer>

    <!-- Node settings drawer -->

    <v-navigation-drawer :right="true" v-model="nodeDrawer" app>
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
                                    <v-text-field label="Times Skill Can Be Bought" v-model="item.max_times" mask="#"></v-text-field>
                                    <v-select v-model="item.colour" :items="possible_colours" item-text="name" item-value="value"></v-select>
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
                                    <v-select v-model="rule.type" :items="rule_types" item-text="name" item-value="value"></v-select>
                                    <v-select v-if="rule.type == 'dependency'" v-model="rule.node" :items="otherNodes(item.id)" item-text="label" item-value="id"></v-select>
                                    <v-text-field label="Level Requirement" v-model="rule.level" v-if="rule.type == 'level'"></v-text-field>
                                    <v-text-field label="Skill Points Required" v-model="rule.skillpoints" v-if="rule.type == 'skillpoint'"></v-text-field>
                                    <v-textarea label="Function" v-model="rule.func" v-if="rule.type == 'function'"></v-textarea>
                                    <span style="color:green" v-if="rule.type == 'function' && rule.actual_func">Compiled successfully!</span>
                                    <span style="color:red" v-if="rule.type == 'function' && !rule.actual_func">Not compiled</span>
                                </v-flex>
                                <v-btn small icon top right v-on:click="deleteRule(item.id, rule.id)">
                                    <v-icon>close</v-icon>
                                </v-btn>
                            </v-layout>
                        </v-container>
                    </v-card>
                </v-flex>
                <v-btn v-on:click="addRule(item.id)">Add Rule</v-btn>
            </v-layout>
        </v-container>
        <v-btn color="blue darken-1" v-on:click="saveNodes()">Save</v-btn>
        <v-btn color="error" v-on:click="nodeDrawer = !nodeDrawer">Cancel</v-btn>
    </v-navigation-drawer>
    <v-snackbar id="snackbar" :timeout="noSelectionSnack.timeout" top v-model="noSelectionSnack.enabled">
        {{ noSelectionSnack.text }}
        <v-btn flat color="pink" @click.native="noSelectionSnack.enabled = false">Close</v-btn>
    </v-snackbar>
    <v-snackbar id="invalid_func_snack" :timeout="invalidFunctionSnack.timeout" top v-model="invalidFunctionSnack.enabled">
        {{ invalidFunctionSnack.text }}
        <v-btn flat color="pink" @click.native="invalidFunctionSnack.enabled = false">Close</v-btn>
    </v-snackbar>

    <v-fab-transition>
        <v-speed-dial v-model="fab" :direction="editDirection" :open-on-hover="hov" bottom right fixed v-show="['skilltree'].indexOf($route.name) > -1">

            <v-btn slot="activator" id="btn_activator" color="blue darken-2" dark fab v-model="fab">
                <v-icon>keyboard_arrow_up</v-icon>
                <v-icon>close</v-icon>
            </v-btn>

            <v-tooltip left>
                <v-btn slot="activator" id="btn_add" fab dark small color="green" @click.native.stop="dialog = true">
                    <v-icon>add</v-icon>
                </v-btn>
                <span>Add Skill</span>
            </v-tooltip>

            <v-tooltip left>
                <v-btn slot="activator" id="btn_edit" fab dark small color="indigo" @click.native.stop="editNode()">
                    <v-icon>edit</v-icon>
                </v-btn>
                <span>Edit Skill</span>
            </v-tooltip>

            <v-tooltip left>
                <v-btn slot="activator" id="btn_delete" fab dark small color="red" @click.native.stop="deleteNodes()">
                    <v-icon>delete</v-icon>
                </v-btn>
                <span>Delete Skill</span>
            </v-tooltip>

        </v-speed-dial>
    </v-fab-transition>
    <v-dialog v-model="dialog" persistent max-width="500px">
        <v-card id="skill_dialog">
            <v-card-title>
                <span class="headline" center>New Skill</span>
            </v-card-title>
            <v-card-text>
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex xs12 sm12 md12>
                            <v-text-field id="skill_name" label="Skill Name" v-model="nodeName"></v-text-field>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn id="btn_add_skill" color="blue darken-1" @click.native="dialog = false" v-on:click="addNode(nodeName)">Add</v-btn>
                <v-btn id="btn_close_skill_dialog" color="error" @click.native="dialog = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="globFrom" persistent max-width="500px">
        <v-card>
            <v-card-title>
                <span class="headline" center>Global Variables</span>
            </v-card-title>
            <v-card-text>
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex xs12 sm12 md12>
                            <v-btn block color="blue darken-1"  @click.native="globFrom = false" v-on:click="strGlobForm = true">String Global Variable</v-btn>
                        </v-flex>
                        <v-flex xs12 sm12 md12>
                            <v-btn block color="blue darken-1"  @click.native="globFrom = false" v-on:click="numGlobForm = true">Number Global Variable</v-btn>
                        </v-flex>
                        <v-flex xs12 sm12 md12>
                            <v-btn block color="error"  @click.native="globFrom = false" v-on:click="deleteForm = true">Delete Global Variable</v-btn>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" @click.native="globFrom = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="strGlobForm" persistent max-width="500px">
        <v-card>
            <v-card-title>
                <span class="headline" center>String/Word Global Variable</span>
            </v-card-title>
            <v-card-text>
                <v-container grid-list-md fluid>
                    <v-layout wrap>
                      <v-flex xs12 sm12 md12>
                          <v-text-field id="var_name" label="Variable Name" v-model="strName"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                          <v-text-field id="var_type" label="Type" v-model="strType"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                          <v-text-field id="var_value" label="Value" v-model="strValue"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                          <v-checkbox id="var_required" label="Required" v-model="strRequired"></v-checkbox>
                      </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1"  @click.native="strGlobForm = false" v-on:click="addStringGlobal(strName,strType,strValue,strRequired)">Add</v-btn>
                <v-btn color="blue darken-1"  @click.native="strGlobForm = false" v-on:click="updateStringGlobal(strName,strType,strValue,strRequired)">Update</v-btn>
                <v-btn color="error" @click.native="strGlobForm = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="numGlobForm" persistent max-width="500px">
        <v-card>
            <v-card-title>
                <span class="headline" center>Number Global Variable</span>
            </v-card-title>
            <v-card-text>
                <v-container grid-list-md>
                    <v-layout wrap>
                      <v-flex xs12 sm12 md12>
                          <v-text-field id="var_name" label="Variable Name" v-model="numName"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                          <v-text-field id="var_type" label="Type" v-model="numType"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                          <v-text-field id="var_value" label="Value" v-model="numValue"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                          <v-checkbox id="var_required" label="Required" v-model="numRequired"></v-checkbox>
                      </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1"  @click.native="numGlobForm = false" v-on:click="addNumberGlobal(numName,numType,numValue,numRequired)">Add</v-btn>
                <v-btn color="blue darken-1"  @click.native="numGlobForm = false" v-on:click="updateNumberGlobal(numName,numType,numValue,numRequired)">Update</v-btn>
                <v-btn color="error" @click.native="numGlobForm = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="deleteForm" persistent max-width="500px">
        <v-card>
            <v-card-title>
                <span class="headline" center>Delete a Global Variable</span>
            </v-card-title>
            <v-card-text>
                <v-container grid-list-md>
                    <v-layout wrap>
                      <v-flex xs12 sm12 md12>
                          <v-text-field id="var_name" label="Variable Name to be deleted" v-model="varName"></v-text-field>
                      </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="warning" @click.native="deleteForm = false" v-on:click="deleteGlobal(varName)">Delete</v-btn>
                <v-btn color="error" @click.native="deleteForm = false">Close</v-btn>
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
                            <br>
                            <p>.json</p>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click.native="fileDialog = false" v-on:click="exportTree(fileName)">Export</v-btn>
                <v-btn color="error" @click.native="fileDialog = false; fileName=''">Close</v-btn>
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
            checkbox: true,
            clipped: true,
            drawer: false,
            nodeDrawer: false,
            settingsDrawer: false,
            miniVariant: false,
            fixed: false,
            nodeName: "",
            strName :"",
            strType :"",
            strValue : "",
            strRequired : false,
            numName :"",
            numType :"",
            numValue : "",
            numRequired : false,
            varName : "",
            copyName: [],
            fileName: "",
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
            invalidFunctionSnack: {
                text: "Error, invalid function",
                timeout: 2000,
                enabled: false,
            },
            title: 'Trii',
            hov: false,
            fab: false,
            editDirection: 'top',
            isVisible: true,
            dialog: false,
            globFrom: false,
            strGlobForm: false,
            numGlobForm: false,
            dialog5: false,
            deleteForm: false,
            fileDialog: false,
            selectedNode: null,
            rules: [],
            rule_types: [{
                    name: "Dependency",
                    value: "dependency"
                },
                {
                    name: "Level",
                    value: "level"
                },
                {
                    name: "Skill Point",
                    value: "skillpoint"
                },
                ],
            possible_colours: [{
                    name: "Purple",
                    value: "#9C27B0"
                    },
                {
                    name: "Red",
                    value: "#f44336"
                    },
                {
                    name: "Blue",
                    value: "#2196F3"
                    },
                {
                    name: "Pink",
                    value: "#E91E63"
                    },
                {
                    name: "Cyan",
                    value: "#00BCD4"
                    },
                {
                    name: "Green",
                    value: "#4CAF50"
                    },
                {
                    name: "Yellow",
                    value: "#FFEB3B"
                    },
                {
                    name: "Orange",
                    value: "#FF5722"
                    },
                {
                    name: "Brown",
                    value: "#795548"
                    },
                {
                    name: "Grey",
                    value: "#616161"
                    },
                ],


        }
    },
    name: 'Trii',
    methods: {
        exportTree: function (fileLabel) {
            var json = controller.getTreeAsJson();
            controller.saveJsonDocument(fileLabel, json);
            this.fileName = "";
        },
        onFileChange: function (e) {
            var files = e.target.files || e.dataTransfer.files;
            var file, fr, results;
            if (!files.length)
                return;
            file = files[0];
            fr = new FileReader();

            fr.onload = function (e) {
                results = e.target.result
                controller.setupFromJson(results);
            }

            fr.onError = function (e) {
                console.log("An error occured");
            }
            fr.readAsText(file);
        },
        addStringGlobal: function(name, type, value, required)
        {
          controller.addStringGlobal(name, type, value, required);
          this.strName ="";
          this.strType ="";
          this.strValue = "";
          this.strRequired = false;
        },
        updateStringGlobal: function(name, type, value, required)
        {
          controller.updateStringGlobal(name, type, value, required);
          this.strName ="";
          this.strType ="";
          this.strValue = "";
          this.strRequired = false;
        },
        addNumberGlobal: function(name, type, value, required)
        {
          controller.addNumberGlobal(name, type, value, required);
          this.numName ="";
          this.numType ="";
          this.numValue = "";
          this.numRequired = false;
        },
        updateNumberGlobal: function(name, type, value, required)
        {
          controller.updateNumberGlobal(name, type, value, required);
          this.numName ="";
          this.numType ="";
          this.numValue = "";
          this.numRequired = false;
        },
        deleteGlobal: function(name)
        {
          controller.deleteGlobal(name);
          this.varName = "";
        },
        addNode: function (nodeLabel) {
            controller.addNode(nodeLabel);
            this.nodeName = "";
        },
        addEdge: function (source, target) {
            controller.addEdge(source.id, target.id);
            this.source = null;
            this.target = null;
        },
        getNodes: function () {
            this.nodes = controller.getNodes();
        },
        deleteNodes: function() {
            var nodes = controller.getSelectedNodes();
            if(nodes.length == 0) {
                this.noSelectionSnack.enabled = true;
                return;
            }
            controller.deleteSelectedNodes();
        },
        undo: function () {
            controller.undo();
        },
        otherNodes: function (id) {
            return this.nodes.filter(n => n.id != id);
        },
        redo: function () {
            controller.redo();
        },
        copy: function () {
            for (var k = 0; k <= this.copyName.length; k++)
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
        deleteRule(skill, rule) {
            controller.deleteRule(skill, rule);
        },
        paste: function () {
            if (this.copyName.lenth == 0)
                return;
            else {
                for (var i = 0; i < this.copyName.length; i++) {
                    controller.addNode(this.copyName[i]);
                }
            }
        },
        editNode: function () {
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
            if (selectedNodes.length == 1) {
                var rules = controller.getRules(selectedNodes[0]);
                this.rules = rules;
            } else {
                this.rules = [];
            }
            this.nodeDrawer = true;
        },
        updateDependencies(id) {
            controller.updateDependencies(id);
        },
        saveNodes: function () {
            var selectedNodes = controller.getSelectedNodes();
            var error = false;
            let n = this.nodes.filter(x => selectedNodes.includes("" + x.id));
            for (var i = 0; i < n.length; i++) {
                controller.updateNode(n[i].id, {
                    label: n[i].label,
                    colour: n[i].colour,
                    description: n[i].description,
                    max_times: n[i].max_times,
                });
                this.updateDependencies(n[i].id);
                n[i].rules.forEach(item => {
                        if(item.type == 'function') {
                            try {
                                item.actual_func = new Function("globals", item.func);
                            }
                            catch(e) {
                                this.invalidFunctionSnack.enabled = true;
                                item.actual_func = undefined;
                                error = true;
                            }
                        }
                })
            }
            if(!error) this.nodeDrawer = false;
        },
        addRule: function (id) {
            controller.addRule(id);
        },
        editSettings: function () {
            this.settingsDrawer = true;
        },
        autoLayout: function () {
            controller.autoLayout();
        },
        newTree: function () {
            controller.clear();
        }
    }
}
</script>
