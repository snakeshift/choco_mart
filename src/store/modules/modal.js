export default {
  namespaced: true,
  state: {
    isShowError: false,
    statusMsg: 'データの更新に失敗しました'
  },
  getters: {
    isShowError(state) {
      return state.isShowError
    },
    statusMsg(state) {
      return state.statusMsg
    }
  },
  mutations: {
    setIsShowError(state, isShowError) {
      state.isShowError = isShowError
    },
    setStatusMsg(state, msg) {
      state.statusMsg = msg
    }
  },
  actions: {}
}