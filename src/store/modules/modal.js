export default {
  namespaced: true,
  state: {
    isShowError: false,
    isShowSuccess: false,
    statusMsg: ''
  },
  getters: {
    isShowError(state) {
      return state.isShowError
    },
    isShowSuccess(state) {
      return state.isShowSuccess
    },
    statusMsg(state) {
      return state.statusMsg
    }
  },
  mutations: {
    setIsShowError(state, isShowError) {
      state.isShowError = isShowError
    },
    setIsShowSuccess(state, isShowSuccess) {
      state.isShowSuccess = isShowSuccess
    },
    setStatusMsg(state, msg) {
      state.statusMsg = msg
    }
  },
  actions: {}
}