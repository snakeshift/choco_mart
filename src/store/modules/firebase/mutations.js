import Vue from 'vue'

export default {
  setBuyList(state, payload) {
    Vue.set(state.buys, payload.index, payload.item)
  },
  setSellList(state, payload) {
    Vue.set(state.sells, payload.index, payload.item)
  },
  setList(state, payload) {
    Vue.set(state.lists, payload.id, payload.item)
  },
  setListBySearch(state, payload) {
    Vue.set(state.searches, payload.id, payload.item)
  },
  resetListBySearch(state, payload) {
    state.searches = {}
  },
  setTalkList(state, payload) {
    Vue.set(state.talks, payload.id, payload.item)
  },
  setCommentList(state, payload) {
    state.comments = payload.item
  },
  resetCommentList(state, payload) {
    state.comments = {}
  },
  setNoticeList(state, payload) {
    Vue.set(state.notices, payload.id, payload.item)
  },
  setTalkMemberList(state, payload) {
    Vue.set(state.talkMembers, payload.id, payload.userData)
  },
  resetTalkMemberList(state, payload) {
    state.talkMembers = {}
  },
  setCount(state, payload) {
    state.counts[payload.type] = payload.count
  }
}