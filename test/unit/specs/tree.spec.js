import * as tree from '@/tree'
import Vue from 'vue'
import Vuetify from 'vuetify'
import skilltree from '@/components/skilltree'
import Router from 'vue-router'
import router from '@/router'
import cytoscape from 'cytoscape'

Vue.use(Vuetify)
Vue.use(Router)
describe('skilltree.vue and tree.js', () => {
  it('should add nodes correctly', () => {
    const Constructor = Vue.extend(skilltree)
    const vm = new Constructor({router}).$mount()
    //test basic adding
    expect(tree.addNode("test")).toEqual("(0,test)");
    //test spaces
    expect(tree.addNode("aaa bbb")).toEqual("(0,test)(1,aaa bbb)");
    //test trimming and special characters
    expect(tree.addNode("   0192~_\\  ")).toEqual("(0,test)(1,aaa bbb)(2,0192~_\\)")
    //clean up
    tree.clean();
  })
})
