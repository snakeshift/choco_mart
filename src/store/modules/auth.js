export const auth = {
  namespaced: true,
  state: {
    user: {},
    userInfo: {},
    status: false
  },
  getters: {
    user(state) {
      return state.user;
    },
    userInfo(state) {
      return state.userInfo
    },
    isSignedIn(state) {
      return state.status;
    }
  },
  mutations: {
    onAuthStateChanged(state, user) {
      state.user = user; //firebaseが返したユーザー情報
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    },
    onUserStatusChanged(state, status) {
      state.status = status; //ログインしてるかどうか true or false
    }
  },
  actions: {

  }
}