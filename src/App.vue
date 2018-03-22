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
      <v-speed-dial
      v-model="fab"
      :direction="editDirection"
      :open-on-hover="hov"
      bottom
      right
      fixed
      v-if="['skilltree'].indexOf($route.name) > -1"
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

      hov:false,
      editDirection:'top',
      isVisible:true,

		}
	},
	name: 'Trii'
}

</script>
