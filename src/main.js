import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import axios from 'axios';
import router from './router.js'
import store  from  './store/store.js';
Vue.use(VueRouter);


//******AXIOS CONFIG*********************/
// axios will use this unless expressly called from one of the other axios instances
//A6 baseURL
// axios.defaults.baseURL = 'https://share-house-a6.firebaseio.com';

//A7 baseUrl
axios.defaults.baseURL = 'https://share-house-a7.firebaseio.com';




//***********VUE ROUTER CONFIG *********/
// const router  = new VueRouter({
//   routes,
//   mode: 'history'
// });
//***********END VUE ROUTER CONFIG *********/



new Vue({
  el: '#app',
  //register routes so the routes works
  router,
  //register store so vuex works
  store,
  render: h => h(App)
})
