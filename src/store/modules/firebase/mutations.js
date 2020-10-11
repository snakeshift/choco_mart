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
  setTalkMemberTradeList(state, payload) {
    state.talkMemberTrades[payload.type].push(payload.item)
  },
  resetTalkMemberTradeList(state, payload) {
    state.talkMemberTrades = {
      buys: [],
      sells: []
    }
  },
  setListenerList(state, payload) {
    Vue.set(state.listeners[payload.type], payload.id, payload.unsubscribe)
  },
  resetListenerList(state, payload) {
    state.listeners[payload.type][payload.id]()
    Vue.delete(state.listeners[payload.type], payload.id)
    Vue.delete(state.notices, payload.id)
  },
  setBadge(state, payload) {
    state.badges[payload.type] += 0.5 // timeStampの更新がサーバー側で行われるため、2回で1カウント
  },
  resetBadge(state, payload) {
    state.badges[payload.type] = 0
  },
  setCount(state, payload) {
    state.counts[payload.type] = payload.count
  },
}