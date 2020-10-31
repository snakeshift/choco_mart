import firebase from 'firebase'
import axios from 'axios'
import { USER_REF, SELL_REF, BUY_REF, NOTICE_REF, BAN_REF } from '@/config/firebase/ref'
import { CURRENT_TIME, INCREMENT, DELETE, ARRAY_UNION, ARRAY_REMOVE } from '@/config/firebase/util'

export default {
  namespaced: true,
  state: {
    user: {},
    userInfo: {},
    status: false,
    banList: []
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
    },
    banList(state) {
      return state.banList
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
    },
    setBanList(state, banList) {
      state.banList = banList
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
    // IP単位でのBANに方針を変えたので現在は未使用
    async registerBan ({ dispatch, commit, getters, rootGetters }, payload) {
      const userId = payload.userId
      const userRef = USER_REF().doc(userId)
      userRef.update({
        isBan: true
      })
    },
    // IP単位でのBANに方針を変えたので現在は未使用
    async releaseBan ({ dispatch, commit, getters, rootGetters }, payload) {
      const userId = payload.userId
      const userRef = USER_REF().doc(userId)
      userRef.update({
        isBan: false
      })
    },
    // BAN監視登録
    async setBanListListener ({ dispatch, commit, getters, rootGetters }, payload) {
      BAN_REF().onSnapshot(function (doc) {
        const ban = doc.data()
        commit('setBanList', ban.list)
      })
    },
    async registerIpBan ({ dispatch, commit, getters, rootGetters }, payload) {
      const pid = payload.pid
      if (pid) {
        await BAN_REF().update({
          list: ARRAY_UNION(pid)
        })
      }
    },
    async releaseIpBan ({ dispatch, commit, getters, rootGetters }, payload) {
      const pid = payload.pid
      if (pid) {
        await BAN_REF().update({
          list: ARRAY_REMOVE(pid)
        })
      }
    },
    async RefreshUser ({ dispatch, commit, getters, rootGetters }, payload) {
      dispatch('getUserAnonymously')
    },
    async updateIcon ({ dispatch, commit, getters, rootGetters }, payload) {
      const userRef = USER_REF().doc(getters.user.uid)
      await userRef.update({
        icon: payload.icon
      })
      userRef.get().then(function(doc) {
        commit('setUserInfo', doc.data())
      })
    },
    async checkPid ({ dispatch, commit, getters, rootGetters }, payload) {
      let pid
      const token = '3773667639e283'
      const ip = await axios.post(`https://ipinfo.io?token=${token}`).then(e => {
        return e.data.ip || ''
      }).catch((error) => {
        return ''
      })

      const mask = (val, key) => {
        let result = ''
        val = encodeURIComponent(val)
        const ipArray = val.split('.')
        for (let i = 0; i < ipArray.length; i++) {
          if (i%2 !== 0) {
            result += ipArray[i]
          } else {
            for (let j = 0; j < ipArray[i].length; j++) {
              result += String.fromCharCode(val.charCodeAt(j) + key)
            }
          }
        }
        result = result.slice(1)
        return result
      }

      pid = ip ? mask(ip, 20) : ''
      return pid
    }
  }
}