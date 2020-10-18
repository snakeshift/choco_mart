import Vue from 'vue'
import firebase from 'firebase';
import store from "@/store";

const config = {
  apiKey: "AIzaSyD8t5QJEMKbg5RYoPN48zk7Kjth6Hb0fxM",
  authDomain: "choco-mart.firebaseapp.com",
  databaseURL: "https://choco-mart.firebaseio.com",
  projectId: "choco-mart",
  storageBucket: "choco-mart.appspot.com",
  messagingSenderId: "779047029524",
  appId: "1:779047029524:web:c37d738044284f727b5001",
  measurementId: "G-2PDBMYBW5Z"
}

const VAPID_KEY = 'BCDw3v7pzwp3ybMscHQoAMeZ0qEVPNxR6lBXt4_IeUOthODzfpXVsmhNwPgxKMUx9B0LfX6k5EE_HEaCVngFGW4'

export default {
  init() {
    firebase.initializeApp(config);
    firebase.analytics();
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  },
  signInAnonymously () {
    return firebase.auth().signInAnonymously()
  },
  logout() {
    firebase.auth().signOut();
  },
  getVapidKey() {
    return VAPID_KEY
  },
  async onAuth() {
    let userData = await this.signInAnonymously()
    store.commit('auth/onAuthStateChanged', userData.user);
    store.commit('auth/onUserStatusChanged', userData.user.uid ? true : false);

    let userRef = firebase.firestore().collection("users").doc(userData.user.uid)
    let sellRef = firebase.firestore().collection("sells").doc(userData.user.uid)
    let buyRef = firebase.firestore().collection("buys").doc(userData.user.uid)
    let noticeRef = firebase.firestore().collection("notices").doc(userData.user.uid)

    await userRef.get().then(function(doc) {
      if (doc.exists) {
        userRef.update({
          updated_at: firebase.firestore.FieldValue.serverTimestamp()
        })
      } else {
        // 初期設定(ユーザー)
        userRef.set({
          updated_at: firebase.firestore.FieldValue.serverTimestamp(),
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
          name: "名も無き冒険者"
        })
        // 初期設定(売る)
        sellRef.set({
          count: 15,
        })
        // 初期設定(売る)
        buyRef.set({
          count: 15,
        })
        // 初期設定(通知)
        noticeRef.set({
          items: []
        })
      }
    });
  }
};