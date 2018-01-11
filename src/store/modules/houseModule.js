import globalAxios from 'axios';
import router from '../../router.js';
import {APIkey, hasRoot} from '../../config.js';


const state = {
  housekey: null, //used when creating a new house - prolly same as activeHouse.houseId, but for now keep separate

  /* activeHouse properties are set from several different places
  *  There is not just one setter                                 */
  activeHouse: { //pull it from db based houseId - found in userModule.name
    // houseId: null,  //TODO this needs to come from firebase
    houseName: '',
    //houseName: string
    members: null
    //members: [ {id: userId, name: firstLast, idAdmin: t/f, role: ''} ]
  },


  //this object is just for easy visualization. It is NEVER used in the code
  houseObjectLooksLike: {
    houseId: '',
    houseName: '',
    // easier to iterate, but more cluttery and request intensive
    // Yeah, no. don't use this one
    members: [
      'userId0',
      'userId1',
      'userId2'
    ],
    admins: [
      'userId0', /* set upon creation */
    ],

    //uses fewer GET and POST requests, but harder to iterate, must update data in multiple nodes
    // BY KEEPING A SEPARATE ADMINS NODE I THINK IT IS MORE SECURE... NOPE!!
    // This one is the way to go. It's way easier to use!
    alernativeMember: [
      {id: 'userId0', isAdmin: true}, /* automatically set admin: true at house creation*/
      {id: 'userId1', isAdmin: false}, /* automatically set admin: false at house join*/
      {id: 'userId2', isAdmin: false}
    ],

    /* **********************
    additional can be added only by admin
    there MUST always be at least one
    maybe even just make it an array to keep it simple
    checking if true with dot notation is easier if obj
    ***********************/
    /* DEPRECATED - MAKES IT TOO COMPLICATED When a feature is instantiated, this node is patched with a value of true*/
    featureSet: {
      supplies: true,
      chores: true
    }
  }

};


const getters = {
  getActiveHouse(state) {
    return state.activeHouse;
  },

  getHousekey(state) {
    return state.housekey;
  },


};
const mutations = {

  CLEAR_HOUSE_DATA(state) {
    state.activeHouse.houseName = '';
    state.activeHouse.members = null;
    state.housekey = null;
    state.houseObjectLooksLike = null;
  },

  SET_HOUSE_ID(state, housekey) {
    // committed from fetchActiveHouse - remove from production - need to find code generator or something
    state.housekey = housekey;
  },

  // SET_HOUSE_MEMBERS(state, payload) {
  //   state.activeHouse.members = payload;
  // },

  SET_HOUSE_NAME(state, name) {
    state.activeHouse.houseName = name;
  },

  SET_HOUSE_MEMBERS(state, members) {
    state.activeHouse.members = members;
  },

};

const actions = {

  leaveHouse({commit}) {

    // check if # of members > 1
    // user can't leave if Admin and members remain
    // he must manually delete them first
    //if user is admin and last member, house and all data will be deleted

    /* maybe set function scope variables ,
    *  Then do all the DB changes at once
    *  Where Each checks the previous one's status code
    *  and only proceeds if code is 200
    * *

    * */

    //remove member node from houses/members.json
    //first get members.json
    // iterate over to find the right [i]
    // modify the array
    // put it back

    //remove house node from users/userId.json
    //can use delete
    //clear relevant state
    //clear relevant local storage

    let token = localStorage.getItem('token');
    let userId = localStorage.getItem('userId');
    let houseId = localStorage.getItem('housekey');


    globalAxios.get('/houses/' + houseId + '/members.json?auth=' + token)
      .then(response => {
        let newMemberArray = [];
        if (response.status === 200) {
          let members = response.data;
          for (let i = 0, ln = members.length; i < ln; i++) {
            if (members[i].id !== userId) {
              newMemberArray.push(members[i]);
            }
          }
          console.log('then new members', newMemberArray.length);
        }
        return newMemberArray;
      })
      .then(members => {
        console.log('new', members);
        //delete house node and put member node
        globalAxios.put('/houses/' + houseId + '/members.json?auth=' + token, members)
          .then(response => {
            if (response.status === 200) {
              globalAxios.delete('/users/' + userId + '/house.json?auth=' + token)
                .then(response => console.log('delete', response))
                .catch(err => console.error(err));
            }
          })
          .catch(err => console.error(err));
        return true;
      })
      .then(bool => {

        console.log('leave house last then bool ', bool);

        /* clear state */
        commit('CLEAR_HOUSE_DATA');
        commit('CLEAR_USER_DATA');

        /* clear storage */
        localStorage.clear();
      })
      .catch(err => console.error(err));
  },


  //payload needs to get changed so it includes isAdmin: t/f
  addMember({commit, dispatch}, payload) {
    /* ****************************
     GET the member data as an array
     modify it
     then PUT it back

     payload expects {housekey: pushId of house}
    *   expects the pushId of the house
    *   provided to the user who pastes it into the join house input field
    *   in AdminHouse.Vue
    *   Yes, this is probably not secure. But it's alpha software.
    *   I'll find a secure way later, maybe like firebase invitations with dynamic URLs.
    *   That's another project for another day

    *****************************/
    console.log('addmember', payload);
    let memberArray = [];
    let houseId = payload.housekey;
    let token = localStorage.getItem('token');
    let userId = localStorage.getItem('userId');

    globalAxios.get('/houses/' + houseId + '/members.json?auth=' + token)
      .then(response => {
        console.log('addMember then ', response.data)
        memberArray = response.data;
        memberArray.push({id: userId, isAdmin: false});
        /* puts the modified array into the houses.houseId.members node*/
        globalAxios.put('houses/' + houseId + '/members.json' + '?auth=' + token, memberArray)
          .then(
            response => {
              console.log(response);
              /* after adding the user to the house, add the house to the user */
              dispatch('addHouseToUser', {houseId: houseId});
            }
          )
          .catch(error => console.error(error));
      })
      .catch(error => {
        console.error(error);
      })
  },


  createNewHouse({commit, state, dispatch}, formData) {
    /* dispatched from AdminHouse.vue.onSubmit() */
    /* house table will store creator as admin */
    // see storeNewUser for how to set uid as key

    let token = localStorage.getItem('token');
    let userId = localStorage.getItem('userId');
    let houseBlob = {
      houseName: formData.houseName,
      members: []
    };
    /* set members and admin in houses node,
    *  fetched in fetchActiveHouse()
    * */
    // Creator added as member here, change to helper function - use for ALL members
    houseBlob.members.push({id: userId, isAdmin: true});

    globalAxios.post('houses.json/' + '?auth=' + token, houseBlob)
      .then(response => {
        // console.log('createNewHouse', response);
        /*captures the firebase pushId for the new house - uses it as houseId*/
        localStorage.setItem('houseKey', response.data.name);
        state.housekey = response.data.name;
        dispatch('instantiateHouse');
        dispatch('fetchActiveHouse');
        commit('SET_BELONGS_TO_HOUSE', true);
        return;
      })

      .catch(error => {
        console.error('createNewHouse', error);
      });

  }, // END createNewHouse

  fetchActiveHouse({commit, dispatch}) {
    /*
    * get the  app user id
      get the user's house

      get the house's member objects
		    - id and isAdmin
		    - set active house member {id, isAdmin}

      use the memeberIds to get the member's names
	      - use for loop to set member name in house obj
    * */

    let token = localStorage.getItem('token');
    let userId = localStorage.getItem('userId');
    let houseId = null;


    let houseBlob = {
      // name: null,
      members: null
    };
    /* ***************************
      OUTSIDE GET REQUEST
      gets the houseId from the users entry in the users table

     ****************************/
    globalAxios.get('/users/' + userId + '/house' + '.json' + '?auth=' + token)
      .then((response) => {

        /* //generated the error at first sign in
        //response.data is coming back null - this is causing the error
        console.warn("fetchActiveHouse - intermittenly generates:" +
          "\n\"TypeError cannot read property 'active' of null\"" +
          "\nif it happens again, note what was done differently" +
          "\nuncomment the above if-stmt and try to replicate" ,
          response)
          */
        if (response.data.active) {

          houseId = response.data.houseId;
          localStorage.setItem('housekey', houseId);
          /* commit setter true for belongs to house */
          commit('SET_BELONGS_TO_HOUSE', true);
          commit('SET_HOUSE_ID', houseId);

        } else {
          commit('SET_BELONGS_TO_HOUSE', false);
          return;
        }

        /* ***************************
            INSIDE GET REQUEST, DEPENDENT ON OUTSIDE
            uses the houseId from the outside request to
            get house-data from houses node in firebase
            sets members
         ****************************/

        globalAxios.get('/houses/' + houseId + '.json' + '?auth=' + token)
          .then(response => {
            /* return the data node, pass it to each succeeding then() */
            return response.data;
          })
          .then(data => {
            //can set member names and info from here using data.members
            /* memberArray holds userIds */
            let memberArray = data.members.slice(0, data.members.length);

            /* first get array of members,
           * then call db for each and get name
           * push name onto new array */
            /* namesArray to hold first and last names*/

            let members = [];

            for (let i = 0, ln = memberArray.length; i < ln; i++) {

              globalAxios.get('/users/' + memberArray[i].id + '.json?auth=' + token)
                .then(response => {

                  let memberBlob = {
                    id: memberArray[i].id,
                    isAdmin: memberArray[i].isAdmin,
                    name: response.data.name.first + ' ' + response.data.name.last,
                    role: ''
                  };
                  /* explicit is better than implicit
                  *  only set role if user is admin
                  */

                  if (memberArray[i].isAdmin === true) {
                    memberBlob.role = 'Admin';
                  }

                  members.push(memberBlob);

                  if (memberArray[i].id === userId) {
                    dispatch('setUserInfo', memberBlob);
                  }
                  return 0;
                })
                .catch(error => console.log('for loop ', error));
            } //end for loop

            commit('SET_HOUSE_MEMBERS', members);

            /* set the house name */
            commit('SET_HOUSE_NAME', data.houseName);

            houseBlob.members = data.members;
            return 0;
          })
          .catch(error => console.error('inside get fetchActiveHouse houses ', error));
      })
      .catch(error => {
        /*if the name isn't in a house, show the makeHouse page*/
        // console.error('outside get fetchActiveHouse users catch ', error);
        router.replace('/adminHouse');

      });
  }, //END fetchActiveHouse


  instantiateHouse({commit, dispatch}) {


    /* this is the unique key generated by firebase for the house node name */
    let pushId = localStorage.getItem('houseKey');
    let token = localStorage.getItem('token');
    let houseBlob = {
      houseId: pushId,
    }

    dispatch('addHouseToUser', houseBlob);

    //these will get moved into their appropriate modules as helpers then get dispatched when user adds data

    globalAxios.patch('houses/' + state.housekey + '/supplies.json' + '?auth=' + token, {0: 'stuff and things'})
      .then(response => {
        console.log('houses/supplies node created')
      })
      .catch(error => console.error('instantiateHouse supplies', error));


    globalAxios.patch('houses/' + state.housekey + '/chores.json' + '?auth=' + token, {0: 'get shit done'})
      .then(response => {
        console.log('houses/chores node created')
      })
      .catch(error => console.error('instantiateHouse chores', error));
  }

};

/* *****************************************************************
        REMOVE THIS COMMENT BLOCK IN A8
I think I need to put the house code directly into the post command
put wipes out the whole node and replaces with whatever you pass in
POST adds new nodes... doesn't modify old one
PATCH replaces the particular child node, instead of adding to it

use put to add a node, TO a specific node, in this case uid/houses - NO - in A6 I'm replacing the whole array

I need to change the syntax of the data being passed in so that 'houses' isn't repeated!!!!
I'm telling it to make houses/houses.json

creates or adds to the houses child of the logged in name's node
  *****************************************************************************/

/*TODO There is NO POINT in creating empty data sets,
 It just clutters up the DB make it so no node is created
 until someone adds a supply or chore

 Also doing it the way it is here is self-defeating
 if a user deletes all the supplies or whatnot, then the node goes away!

 */


export default {
  // namespaced: true,
  state,
  mutations,
  actions,
  getters,

}
