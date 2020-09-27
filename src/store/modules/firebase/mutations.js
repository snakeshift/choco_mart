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
  setCount(state, payload) {
    state.counts[payload.type] = payload.count
  }
}