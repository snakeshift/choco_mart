import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import vuetify from './plugins/vuetify'
import './plugins/firebase'

import { firestorePlugin } from 'vuefire'  
import firebaseConfig from './plugins/firebase'
import 'firebase/firestore'

import firebase from 'firebase'

import mixin from './mixins/index'

import smoothscroll from 'smoothscroll-polyfill'
 
// kick off the polyfill!
smoothscroll.polyfill()

Vue.use(firestorePlugin)

Vue.store = store

// バーション情報確認
// let version = window.localStorage.getItem("version"); 
// confirmVersion(version)

// async function confirmVersion(localVersion){
//   let versionInfo = await firebase.firestore().collection("server").doc("version").get()
//   let serverVersion = versionInfo.data().no
//   if(localVersion != serverVersion){
//     window.localStorage.setItem("version",serverVersion);
//     if(localVersion != null){
//       window.location.reload(true);
//     }
//   }
// }

Vue.mixin(mixin)

Vue.config.productionTip = false

const getUserData = async () => {
  const user = await firebase.auth().signInAnonymously()
  return user
}

// Initialize Firebase
const firebaseInit = async () => {
  await firebaseConfig.init()
}

// homeへ移動した後に、ユーザ情報が取れなければInitへ飛ばす

// 

// router.beforeEach((to, from, next) => {

  // if (to.path !== '/home') {
  //   next('/home');
  // } else {
  //   next();
  // }
  // 認証情報を取得
  // let userData = await getUserData()
  // store.commit('auth/onAuthStateChanged', userData.user);
  // store.commit('auth/onUserStatusChanged', userData.user.uid ? true : false);
  // let userRef = firebase.firestore().collection("users").doc(userData.user.uid)
  // console.log("aa")
  // await userRef.get().then(function(doc) {
  //   if(doc.exists) {
  //     userRef.update({
  //       updated_at: firebase.firestore.FieldValue.serverTimestamp()
  //     })
  //     // next('/home') //homeに飛ばす
  //   }else{
  //     // 認証情報が取れていなければ初期化ページに飛ばす
  //     // next('/')
  //   }
  // })
// })
// firebase.auth().signOut();

const init = async () => {
  await firebaseInit()
  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
  }).$mount('#app')
}

init()