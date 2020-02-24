<template>
  <div class="init">
    <div class="init_display">
      <div class="init_head"></div>
    </div>
    <loading></loading>
  </div>
</template>

<script>
import firebase from 'firebase'
import store from '../store'
import loading from '@/components/loading.vue'

export default {
  name: 'Init',
  data () {
    return {
    }
  },
  components: {
    loading
  },
  created(){
    store.commit('loading/setIsLoading', true)
    store.commit('loading/setStatusMsg', "読み込み中..")
  },
  async mounted () {
    let t = this
    let userData = await firebase.auth().signInAnonymously()
    store.commit('auth/onAuthStateChanged', userData.user);
    store.commit('auth/onUserStatusChanged', userData.user.uid ? true : false);

    let userRef = firebase.firestore().collection("users").doc(userData.user.uid)
    let sellRef = firebase.firestore().collection("sells").doc(userData.user.uid)
    let buyRef = firebase.firestore().collection("buys").doc(userData.user.uid)
    let noticeRef = firebase.firestore().collection("notices").doc(userData.user.uid)

    await userRef.get().then(function(doc) {
      if (doc.exists) {
        store.commit('loading/setStatusMsg', "ユーザー情報更新中..")
        userRef.update({
          updated_at: firebase.firestore.FieldValue.serverTimestamp()
        })
      } else {
        store.commit('loading/setStatusMsg', "初回ユーザー情報作成中..")
        // 初期設定(ユーザー)
        userRef.set({
          updated_at: firebase.firestore.FieldValue.serverTimestamp(),
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
          name: "名も無き冒険者",
          icon: Math.floor( Math.random() * (37 + 1 - 1) ) + 1
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
    store.commit('loading/setStatusMsg', "ユーザー更新完了..")
    setTimeout(function(){
      t.$router.push('home')
      store.commit('loading/setIsLoading', false)
    },1500)
  },
};
</script>

<style lang="scss">
.init{
  z-index: 100;
}
.init_head{
  position: absolute;
  height: 50px;
  width: 250px;
  top: 15px;
  left: 10px;
  background-size: contain;
  background-image: url("../assets/imgs/game_title.png");
  background-repeat: no-repeat;
  z-index: 10;
}
.init_foot{
  position: absolute;
  top: 56%;
  left: 50%;
  transform: translate(-50%,-50%);
  text-align: center;
  font-size: 18px;
  z-index: 10;
  color: #fff;
  font-family: "choco";
}
</style>