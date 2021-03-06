import Vue from 'vue';
import Vuex from 'vuex';

// import suppliesModule from './modules/supplyLITE.js';
// import choreModule from './modules/choreLITE.js';
import auth from './modules/authModule.js';
import user from './modules/userModule.js';
import house from './modules/houseModule.js';




// import * as actions from './actions.js';


Vue.use(Vuex);

// Note the uppercase 'S' in .Store
// export const store = new Vuex.Store({

// export default is necessary for dispatch to work in components
export default new Vuex.Store({
  state:{},
  getters:{},
  //mutations MUST run synchronously
  mutations:{},
  actions:{},
  modules: {
    // choreModule,
    // suppliesModule,
    auth,
    house,
    user
  }

}); // END STORE

// export default store;
