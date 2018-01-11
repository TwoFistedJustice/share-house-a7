
// import globalAxios from 'axios';
import authAxios from '../../axios/axios-auth.js';
import router from '../../router.js';
/* hasRoot looks like {root: true}, is for vuex namespacing*/
import {APIkey, hasRoot} from '../../config.js';


const state = {
  idToken: null, /* 'A Firebase Auth ID token for the authenticated name.' */

  keepMeLoggedIn: true, //to be set by name - eventually
  refreshToken: null,
  userId: null, /* holds data.localid "The uid of the authenticated name." */

  // name: { //should be moved to userModule
  //   first: null,
  //   last: null,
  // }
};

const getters = {

  isAuthenticated(state) {
    /*used in Header.vue  to display or not different components*/
    return state.idToken != null;
  },
};


const mutations = {
  SET_AUTH_DATA(state, userData) {
    // console.log('authuser');
    state.idToken = userData.idToken;
    state.refreshToken = userData.refreshToken;
    state.userId = userData.userId;

  },

  CLEAR_AUTH_DATA(state) {
    state.idToken = null;
    state.userId = null;
  },

  // SET_USER(state, userBlob) {
  //   state.name.first = userBlob.name.first;
  //   state.name.last = userBlob.name.last;
  // },

};

const actions = {

  //this should be part of auth
  // createNewUser({commit, dispatch, state}, formData) {
  //   console.log('createNewUser', APIkey);
  //
  //   authAxios.post('/signupNewUser?key=' + APIkey, {
  //     email: formData.email,
  //     password: formData.password,
  //     returnSecureToken: true
  //   })
  //     .then(response => {
  //       console.log('DEV createNewUser', response);
  //       let authBlob = {
  //         idToken: response.data.idToken,
  //         userId: response.data.localId
  //       };
  //       // dispatch('user/storeNewUser', {signupData: formData, authBlob: authBlob}, { root: true });
  //       dispatch('storeNewUser', {signupData: formData, authBlob: authBlob});
  //       /* after signing up, go to sign in page */
  //       console.log('router replace signin create name');
  //       router.replace('/signin');
  //     })
  //     .catch(error => {
  //       console.error('createNewUser', error);
  //     });
  //
  // },


  login({commit, dispatch, state}, authData) {

    authAxios.post('/verifyPassword?key=' + APIkey, {
      email: authData.email,
      password: authData.password,
      returnSecureToken: true
    })
      .then(response => {
        password: authData.password,
          console.log('login.then', response);
        commit('SET_AUTH_DATA', {
          idToken: response.data.idToken,
          refreshToken: response.data.refreshToken,
          userId: response.data.localId
        });

        dispatch('setLocalStorage', response.data, 'login');
        dispatch('logoutTimer', response.data.expiresIn);
        // dispatch('fetchUser');
        dispatch('fetchActiveHouse');

        router.replace('/dashboard');

      })
      .catch(error => {
        console.error('login', error);
      });
  },

  loginOmatic({commit, dispatch}) {
    /* dispatched from app.vue.created */

    // dispatch authuser from here first
    // then see if we need it in refresh log in

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const expirationDate = localStorage.getItem('expirationDate');
    const now = new Date().getTime();

    let authBlob = {
      idToken: token,
      userId: userId
    };
    if (!token) {
      // console.log('loginOmatic sees no token, you must sign in');
      // console.log('router.replace signin - loginOmatic NO TOKEN')
      router.replace('/signin');
      return;
    }
    else if (now <= expirationDate) {
      commit('SET_AUTH_DATA', authBlob);
      // dispatch('fetchUser', 'loginOmatic if now less than expiration');
      dispatch('fetchActiveHouse');
    }
    else {
      dispatch('refreshLogin', '************************loginOmatic final else');
    }
  },


  logout({commit}) {
    // console.log('****************** logout');
    commit('CLEAR_AUTH_DATA');
    commit('CLEAR_HOUSE_DATA');
    commit('CLEAR_USER_DATA');
    localStorage.clear();
    router.replace('/signin');
  },

  logoutTimer({commit, state, dispatch}, expirationTime) {
    /* dispatched from signin */
    /*
     TODO add keep me logged in as a feature in A8 or later

    If state.keepMeLoggedIn is true, dispatch refresh one second before token expires
    otherwise, logout in one hour

    */

    if (state.keepMeLoggedIn) {
      setTimeout(() => {
        dispatch('refreshLogin')
      }, expirationTime * 999);
    } else {
      setTimeout(() => {
        dispatch('logout')
      }, expirationTime * 1000);
    }
  },

  refreshLogin({commit, dispatch}) {

    let refreshToken = localStorage.getItem('refreshToken');

    authAxios.post('https://securetoken.googleapis.com/v1/token?key=' + APIkey,
      'grant_type=refresh_token&refresh_token=' + refreshToken)

      .then(response => {
        // console.log('refresh', response);
        commit('SET_AUTH_DATA', {
          idToken: response.data.id_token,
          refreshToken: response.data.refresh_token,
          userId: response.data.user_id
        });

        router.replace('/dashboard');

        /* *************************************
          firebase properties for refresh use same names, but different case than for log-in
          except user_id is the same as localId
        **************************************/
        dispatch('setLocalStorage', {
          expiresIn: response.data.expires_in,
          refreshToken: response.data.refresh_token,
          idToken: response.data.id_token,
          localId: response.data.user_id

        }, '****************refreshLogin');
        dispatch('fetchActiveHouse');


      })
      .catch(error => console.error('refresh: ', error));
  },


  setLocalStorage({commit}, resData) {

    /* *******************************
    Beware of firebase naming conventions -
    they vary between api features for essentially the same data
    ********************************/


    //get the current date for use with localStorage
    const now = new Date();
    //convert the date to the exact time in milliseconds and add the expiration time in ms
    //The getTime() method returns the number of milliseconds between midnight of January 1, 1970 and the specified date.
    const expirationTime = new Date(now.getTime() + resData.expiresIn * 1000);

    localStorage.setItem('expirationDate', expirationTime);
    localStorage.setItem('refreshToken', resData.refreshToken);
    localStorage.setItem('token', resData.idToken);
    localStorage.setItem('userId', resData.localId);
  }
};



export default {
  // namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
