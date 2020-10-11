export default {
  namespaced: true,
  state: {
    isLoading: false,
    statusMsg: '読み込み中'
  },
  getters: {
    isLoading(state) {
      return state.isLoading
    },
    getStatusMsg(state) {
      return state.statusMsg
    }
  },
  mutations: {
    setIsLoading(state, isLoading) {
      state.isLoading = isLoading
    },
    setStatusMsg(state, msg) {
      state.statusMsg = msg
    }
  },
  actions: {}
}