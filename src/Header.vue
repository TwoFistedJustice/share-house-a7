<template>
  <div>
    <nav class="navbar navbar-default">
      <button v-if="isAuthenticated" @click="TestFn" class="btn btn-danger">Test Function</button>
      <div class="container-fluid">
        <div class="navbar-header">
          <router-link to="/"
                       class="navbar-brand">Share House A7 - Authentication
          </router-link>

          <p>{{getUserInfo.name}} {{getActiveHouse.houseName}} <b>{{getUserInfo.role}}</b></p>

        </div>

        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">

          </form>
          <ul class="nav navbar-nav navbar-right list-group">

            <li
              @mouseenter="isAdminOpen =!isAdminOpen"
              @mouseleave="isAdminOpen =!isAdminOpen"
              class="dropdown-toggle"
              :class="{open: isAdminOpen}">
              <a href="#"
                 class="dropdown-toggle"
                 data-toggle="dropdown"
                 role="button"
                 aria-haspopup="true"
                 aria-expanded="false">Admin <span class="caret"></span></a>
              <ul class="dropdown-menu">

                <li >
                  <button v-if="isAuthenticated" @click="onLogout" class="btn btn-warning">Logout</button>
                </li>
                <router-link to="/"
                             tag="li"
                             active-class="" exact><a>Home </a></router-link>
                <router-link v-if="!isAuthenticated"
                             to="signup"
                             tag="li"
                             active-class=""
                             class="list-group-item" exact><a>Sign Up</a></router-link>

                <router-link v-if="!isAuthenticated"
                             to="signin"
                             tag="li"
                             active-class=""
                             class="list-group-item" exact><a>Sign In</a></router-link>

                <router-link v-if="isAuthenticated"
                             to="dashboard"
                             tag="li"
                             active-class=""
                             class="list-group-item" exact><a>Dashboard</a></router-link>

                <router-link v-if="isAuthenticated"
                             to="adminHouse"
                             tag="li"
                             active-class=""
                             class="list-group-item" exact><a>Adminstrate House</a></router-link>



              </ul>
            </li>

            <li  v-if="isAuthenticated"
                 @mouseenter="isDropDownOpen =!isDropDownOpen"
                 @mouseleave="isDropDownOpen =!isDropDownOpen"
                 class="dropdown-toggle"
                 :class="{open: isDropDownOpen}">
              <a href="#"
                 class="dropdown-toggle"
                 data-toggle="dropdown"
                 role="button"
                 aria-haspopup="true"
                 aria-expanded="false">Components <span class="caret"></span></a>
              <ul class="dropdown-menu">


                <router-link to="TEST"
                             tag="li"
                             active-class=""
                             class="list-group-item" exact><a>TEST </a></router-link>




              </ul>
            </li> <!-- END DROP DOWN -->

          </ul>
        </div><!-- /.navbar-collapse -->

      </div><!-- /.container-fluid -->
    </nav>


    <ul class="nav nav-pills">
      <!-- <li role="presentation" ><routes-link to="/">Home</routes-link></li> -->
      <!-- <li role="presentation"><routes-link to="/weHave">weHave</routes-link></li> -->


    </ul>

  </div>
</template>

<script>
  import * as types from './store/types.js';
  import {mapActions} from 'vuex';
  import {mapGetters} from 'vuex';

  export default {
    data() {
      return {
        isAdminOpen: false,
        isDropDownOpen: false
      };
    },
    computed: {
      ...mapGetters([
        'isAuthenticated',
        'getActiveHouse',
        'getUserInfo'
      ]),

    },
    methods: {

      ...mapActions({
        saveSupplies: types.SUPPLY_SAVE_SUPPLY,
        fetchSupplies: types.SUPPLY_FETCH_SUPPLY
      }),
      TestFn(){
        console.log('test');
        this.$store.dispatch('leaveHouse');
      },
      onLogout(){
        this.$store.dispatch('logout');
      }
    }
  }
</script>
<style scoped>


  .logout {
    background-color: transparent;
    border: none;
    font: inherit;
    color: white;
    cursor: pointer;
  }

</style>
