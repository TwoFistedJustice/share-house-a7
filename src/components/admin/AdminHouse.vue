<template>

  <div>
    <div class="row">
      <h1>AdminHouse.vue</h1>

      <!--   DISPLAY HOUSE INFO-->
      <div v-if="getBelongsToHouse">
        <h2>House: {{getActiveHouse.houseName}} </h2>
        <p>housekey: {{getHousekey}}</p>
        <h2>1. make each housemate a component</h2>
        <h2>2. Should only be visible to Admins - check vs vuex state</h2>
        <h2>3. should only be changeable by Admins - check vs firebase</h2>
        <p>Housemates: </p>
        <ul>
          <li v-for="member in getActiveHouse.members">{{member.name}} -- {{member.role}}</li>
        </ul>
      </div>

      <!--   JOIN OR CREATE A HOUSE-->
      <div class="form-group" v-if="!getBelongsToHouse">
        <p>I would like to </p>
        <label for="join">
          <input type="radio" id="join" value="join" v-model="knock">
          JOIN a house</label>
        <br>
        <label for="create">
          <input type="radio" id="create" value="build" v-model="knock">
          CREATE a house</label>



      <form @submit.prevent="createHouse" v-if='knock =="build"'>
        <div class="input">
          <label for="houseName">Name your house: </label>
          <input
            type="text"
            id="lastName"
            v-model="houseName">
          <button class="btn btn-primary" type="submit">Create House</button>
        </div>

      </form>


      <form @submit.prevent="joinHouse" v-if='knock =="join"'>
        <div class="input">
          <label for="houseName">Paste housekey</label>
          <input
            type="text"
            id="lastName"
            v-model="housekey">
          <button class="btn btn-success" type="submit">Join House</button>
        </div>


      </form>

      </div>
      <!--   END END END JOIN OR CREATE A HOUSE-->

    </div>

    <div class="row">
      <br><br><br>
      <ul>
        <li>Adminstrate House</li>
        <li>Show/change name of house</li>
        <li>Delete house</li>
        <li>Show Admins of House</li>
        <li>Show Members of House</li>
        <li> *** - Delete member</li>
        <li>Show featureSet</li>
      </ul>

    </div>
  </div>
</template>


<script>
  import {mapGetters} from 'vuex';

  export default {
    props: [],
    data: function () {
      return {

        houseName: 'Christmas Town',
        housekey: '',
        knock: null,
        // join: null,


      };

    },
    computed: {
      ...mapGetters([
        'getActiveHouse',
        'getBelongsToHouse',
        'getHousekey',

      ]),


    },
    methods: {

      createHouse() {
        const formData = {
          houseName: this.houseName
        };
        this.$store.dispatch('createNewHouse', formData);
        this.houseName = '';
      },

      joinHouse() {
          const formData = {
            housekey: this.housekey

          };
          console.clear();
          console.log('***********join house button not active yet', this.housekey);
          this.$store.dispatch('addMember', formData);

          this.housekey = '';

      },
    }


  }
</script>

<style scoped>

</style>
