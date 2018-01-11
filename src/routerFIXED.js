import Vue from 'vue';
import VueRouter from 'vue-router';


import Home from './Home.vue';
import SignUp from './components/auth/SignUp.vue';
import SignIn from './components/auth/SignIn.vue';
import TEST from './components/TEST.vue';
Vue.use(VueRouter);


export const routes = [
  {path: '', component: Home},
  {path: '/', component: Home},
  {path: '/signup', component: SignUp, name: 'signup'},
  {path: '/signin', component: SignIn, name: 'signin'},
  {path: '/TEST', component: TEST, name: 'TEST'},

];

export default new VueRouter({mode: 'history', routes})
