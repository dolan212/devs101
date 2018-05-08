import Vue from 'vue';
import Vuex from 'vuex';
import tree from './modules/treeStore'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex);


export const store = new Vuex.Store({
  modules:
  {
    tree
  },
  plugins: [createPersistedState({
    reducer: state => ({
        }),
  })],
});
