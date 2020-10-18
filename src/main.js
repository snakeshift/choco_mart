import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import vuetify from './plugins/vuetify'
import firebase from 'firebase'

import firebaseConfig from './plugins/firebase'
import 'firebase/firestore'

import mixin from './mixins/index'

import smoothscroll from 'smoothscroll-polyfill'

import sanitizeHTML from 'sanitize-html'
 
// kick off the polyfill!
smoothscroll.polyfill()

Vue.store = store

Vue.mixin(mixin)

Vue.config.productionTip = false

Vue.prototype.$sanitize = sanitizeHTML

// Initialize Firebase
const firebaseInit = async () => {
  await firebaseConfig.init()
  if (firebase.messaging.isSupported()) {
    firebase.messaging().usePublicVapidKey(firebaseConfig.getVapidKey())
  }  
}

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