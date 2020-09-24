import firebase from 'firebase'
import { USER_REF, SELL_REF, BUY_REF, NOTICE_REF } from '@/config/firebase/ref'

export default {
  namespaced: true,
  state: {
    user: {},
    userInfo: {},
    status: false
  },
  getters: {
    user(state) {
      return state.user
    },
    userInfo(state) {
      return state.userInfo
    },
    isSignedIn(state) {
      return state.status
    }
  },
  mutations: {
    onAuthStateChanged(state, user) {
      state.user = user //firebaseが返したユーザー情報
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    },
    onUserStatusChanged(state, status) {
      state.status = status //ログインしてるかどうか true or false
    }
  },
  actions: {
    async getUserAnonymously({ dispatch, commit, getters, rootGetters }, payload) {
      const userData = await firebase.auth().signInAnonymously()
      const isExistUserInfo = userData.user.uid ? true : false
      commit('onAuthStateChanged', userData.user)
      commit('onUserStatusChanged', isExistUserInfo)
    },
    async getCurrentUser({ dispatch, commit, getters, rootGetters }, payload) {
      const userData = await firebase.auth().currentUser
      const isExistUserInfo = userData.user.uid ? true : false
      commit('onAuthStateChanged', userData.user)
      commit('onUserStatusChanged', isExistUserInfo)
    },
    async getUserById ({ dispatch, commit, getters, rootGetters }, payload) {
      const userRef = USER_REF().doc(payload.userId)
      const data = await userRef.get().then(function(doc) {
        return doc.data()
      })
      return data
    },
    async getUsersName ({ dispatch, commit, getters, rootGetters }, payload) {
      const usersName = []
      await USER_REF().get().then(function(doc){
        for(const user of doc.docs){
          const userData = user.data()
          usersName.push(userData.name)
        }
      })
      return usersName
    },
    async updateUserName ({ dispatch, commit, getters, rootGetters }, payload) {
      const user = getters.user
      const userRef = USER_REF().doc(user.uid)

      const names = await dispatch('getUsersName')
      if (names.includes(payload.userName)){
        // 存在する
        return false
      }else{
        if(user) {
          user.updateProfile({
            displayName: payload.userName
          })
          userRef.update({
            name: payload.userName
          })
        }
        return true
      }
    },
    async RefreshUser ({ dispatch, commit, getters, rootGetters }, payload) {
      dispatch('getUserAnonymously')
    },
  }
}