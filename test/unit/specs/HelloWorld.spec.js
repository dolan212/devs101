import Vue from 'vue'
import Vuetify from 'vuetify'
import HelloWorld from '@/components/HelloWorld'
import Router from 'vue-router'
import router from '@/router'

Vue.use(Vuetify)
Vue.use(Router)
describe('HelloWorld.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(HelloWorld)
    const vm = new Constructor({router}).$mount()
    expect(vm.$el.querySelector('h3').textContent)
      .toEqual('Welcome to Trii')
  })
})
