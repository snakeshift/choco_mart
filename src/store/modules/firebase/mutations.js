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
  }
}