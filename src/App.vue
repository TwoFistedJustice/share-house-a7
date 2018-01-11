<template>
<div class="container">

  <div class="row">
    <div class="md-12">
    <app-header></app-header>
    <router-view></router-view>
    </div>
  </div>
</div>
</template>


<script>
import Header from './Header.vue';
import * as types from './store/types.js';
//import {mapActions} from 'vuex';



export default {
  data: function(){
    return {

    }

  },
  components: {

    appHeader: Header

  },
    created(){
        // this.$store.dispatch('initChores');
        // this.$store.dispatch(types.SUPPLY_FETCH_SUPPLY);
//      this.$store.dispatch('initData');
//       console.log('*****************created*******************');

      this.$store.dispatch('loginOmatic');
      // this.$store.dispatch('authInit');


    },


}
</script>

