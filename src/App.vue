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
      <v-layout row v-if="['skilltree'].indexOf($route.name) > -1">
        <v-layout row class="left-fab-container">
          <v-speed-dial
          v-model="fab"
          :direction="editDirection"
          :open-on-hover="hov"
          >
            <v-btn
              slot="activator"
              color="blue darken-2"
              dark
              fab
              hover
              v-model="fab"
              >
              <v-icon>keyboard_arrow_right</v-icon>
              <v-icon>close</v-icon>
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
        </v-layout>

        <v-layout row class="right-fab-container">
          <v-btn
            fab
            dark
            color="red"
          >
            <v-icon>add</v-icon>
          </v-btn>
        </v-layout>
      </v-layout>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2018 devs101</span>
    </v-footer>
  </v-app>
</template>

<style>
  .left-fab-container
  {
    position: fixed;
    bottom: 45px;
    left: 0;
  }
  .right-fab-container
  {
    position: fixed;
    bottom: 45px;
    right: 0;
  }
</style>

<script>
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

      hov:true,
      editDirection:'right',
      isVisible:true,

		}
	},
	name: 'Trii'
}
</script>
