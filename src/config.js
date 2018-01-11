import {apiKey, databaseURL} from '../../share-house-config/share-house-config-a7'
export const APIkey = apiKey;
export const dataBaseUrl = databaseURL;

/* hasRoot is for vuex automatic namespacing. This object is required to dispatch
*   or commit actions or mutations from another module*/
export const hasRoot = {root: true};
