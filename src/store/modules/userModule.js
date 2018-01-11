import authAxios from '../../axios/axios-auth.js';
import globalAxios from 'axios';
import router from '../../router.js';
import {APIkey, hasRoot} from '../../config.js';

/* USER DATA THAT DOES NOT BELONG TO AUTH GOES HERE
*   nicknames, user settings, etc.
*
* */

const state = {
  /* belongToHouse is a bool based on DB query that returns true if user belongs to a house an false if not */
  belongsToHouse: false,
  userInfo: {
    name: null,
    isAdmin: false,
    role: ''
  }

};

const getters = {
  getBelongsToHouse(state) {
    /* used to set v-if in components */

    return state.belongsToHouse;
  },

  getUserInfo(state) {
    return state.userInfo;
  },

};


const mutations = {
  CLEAR_USER_DATA(state) {
    state.belongsToHouse = false;
    state.userInfo.name = '';
    state.userInfo.isAdmin = false;
    state.userInfo.role = '';
  },
  SET_BELONGS_TO_HOUSE(state, bool) {
    state.belongsToHouse = bool;
    localStorage.setItem('belongsToHouse', bool);
  },

  SET_USER_INFO(state, userBlob) {
      /* Set user's name, admin status, and role */

    //trying to use getters in this caused A LOT of headache

    state.userInfo.name = userBlob.name;
    state.userInfo.isAdmin = userBlob.isAdmin;
    state.userInfo.role = userBlob.role;
  },


};
const actions = {

  setUserInfo({commit}, payload) {
        commit('SET_USER_INFO', payload,);
  },


  addHouseToUser({commit, dispatch}, payload) {
    /*
    payload expects - same as houseBlob in instantiateHouse
    {
      houseId: pushId,
      active: true
      }

    * */

    let token = localStorage.getItem('token');
    let userId = localStorage.getItem('userId');
    let houseBlob = {
      houseId: payload.houseId,
      active: true
    }


    globalAxios.patch('users/' + userId + '/house.json' + '?auth=' + token, houseBlob)
    /*creates the house node in the name's node*/
      .then(response => {
        // console.log('instantiateHouse', response);
        console.log('addHouseToUser', houseBlob);
        dispatch('fetchActiveHouse');

      })
      .catch(error => console.error('addHouseToUser', error));
  },


  //this should be part of auth
  createNewUser({commit, dispatch, state}, formData) {
    console.log('createNewUser', APIkey);
    /*dispatched from SignUp.vue*/

    authAxios.post('/signupNewUser?key=' + APIkey, {
      email: formData.email,
      password: formData.password,
      returnSecureToken: true
    })
      .then(response => {
        console.log('DEV createNewUser', response);
        let authBlob = {
          idToken: response.data.idToken,
          userId: response.data.localId
        };
        dispatch('storeNewUser', {signupData: formData, authBlob: authBlob});
        /* after signing up, go to sign in page */
        console.log('router replace signin create name');
        router.replace('/signin');
      })
      .catch(error => {
        console.error('createNewUser', error);
      });

  },


  /* adds to  name object in DB, captures UID */
  storeNewUser({commit, state}, payload) {

    /* get token from auth */
    let token = payload.authBlob.idToken;
    let uid = payload.authBlob.userId;
    if (!token) {
      return;
    }

    let userBlob = {
      name: {
        last: payload.signupData.lastName,
        first: payload.signupData.firstName,
      },

      email: payload.signupData.email,
      userId: payload.authBlob.userId
    };
    /* stores firebase node-key of new name */

    /* 'patch' allows userID as node name :-) */
    globalAxios.patch('users/' + uid + '.json/' + '?auth=' + token, userBlob)
      .then(response => {
        console.log("userModule.storeUser", response)
      })
      .catch(error => console.error("userModule.storeUser", error));
  },

};


export default {
  // namespaced: true,
  state,
  mutations,
  actions,
  getters

}
