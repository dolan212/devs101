<template>
<v-container grid-list-md text-xs-center fill-height>
    <v-layout row wrap fill-height>
        <v-flex m2 xs0>
            <v-img :src="logo" alt="Trii Logo">
                <v-layout slot="placeholder" fill-height align-center justify-center ma-0>
                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                </v-layout>
            </v-img>
        </v-flex>
        <v-flex xs12 m6>
            <h3 class="display-3" id="welcome_title" v-text="welcomeMsg"></h3>
            <span class="subheading" id="welcome_sub" v-text="welcomeSubtitle"></span>
            <v-divider class="my-3"></v-divider>
            <v-btn large color="primary" :to="{path: '/skilltree'}" id="start_button" class="mx-0">Get Started</v-btn>
        </v-flex>
        <v-flex m3 xs0>
        </v-flex>
    </v-layout>
</v-container>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h1,
    h2 {
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
import logo from '@/assets/logo.png'
export default {
    data() {
        return {
            welcomeMsg: 'Welcome to Trii',
            welcomeSubtitle: 'A project by devs101',
            logo: logo
        }
    }
}
</script>

<style scoped>
h1,
h2 {
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
