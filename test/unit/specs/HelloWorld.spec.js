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
    expect(vm.$el.querySelector('#welcome_title').textContent)
      .toEqual('Welcome to Trii')
    expect(vm.$el.querySelector("#welcome_sub").textContent).toEqual("A project by devs101")
    expect(vm.$el.querySelector("#start_button").textContent).toEqual("Get Started")
  })
})
