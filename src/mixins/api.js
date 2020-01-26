import firebase from 'firebase'
import store from "@/store"
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default{
  methods:{
    async GetUser () {
      let user = await firebase.auth().currentUser;
      return user
    },
    async GetUserById (userId) {
      let userRef = firebase.firestore().collection("users").doc(userId)
      let data
      await userRef.get().then(function(doc) {
        data = doc.data()
      })
      return data
    },
    async SetUserName (user_name) {
      let user = await firebase.auth().currentUser;
      let userRef = firebase.firestore().collection("users").doc(user.uid)

      if(user) {
        user.updateProfile({
          displayName: user_name
        })
        userRef.update({
          name: user_name
        })
      }
    },
    async RefreshUser () {
      let userData = await firebase.auth().signInAnonymously()
      store.commit('auth/onAuthStateChanged', userData.user);
      store.commit('auth/onUserStatusChanged', userData.user.uid ? true : false);
    },
    async RefreshSellList () {
      let sellRef = firebase.firestore().collection("sells").doc(this.User.uid)
      let data
      await sellRef.get().then(function(doc) {
        data = doc.data()
      })
      return data
    },
    async RefreshBuyList () {
      let buyRef = firebase.firestore().collection("buys").doc(this.User.uid)
      let data
      await buyRef.get().then(function(doc) {
        data = doc.data()
      })
      return data
    },
    async RefreshCommentList (itemId) {
      let commentRef = firebase.firestore().collection("comments").doc(itemId)
      let data
      await commentRef.get().then(function(doc) {
        data = doc.data()
      })
      return data
    }
  },
  computed: {
    ...mapGetters({
      User: 'auth/user',
    }),
  },
}