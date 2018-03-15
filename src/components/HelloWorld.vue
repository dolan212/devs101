<template>
    <v-container grid-list-md text-xs-center fill-height>
      <v-layout row wrap fill-height>
        <v-flex m3 xs0>
        </v-flex>
        <v-flex xs12 m6>
          <h3 class="display-3" v-text="welcomeMsg"></h3>
          <span class="subheading" v-text="welcomeSubtitle"></span>
          <v-divider class="my-3"></v-divider>
          <v-btn large color="primary" class="mx-0">Get Started</v-btn>
        </v-flex>
        <v-flex m3 xs0>
        </v-flex>
      </v-layout>
    </v-container>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
<script>
export default {
	data() {
		return {
			welcomeMsg: 'Welcome to Trii',
			welcomeSubtitle: 'A project by devs101'
		}
	}
}
</script>
