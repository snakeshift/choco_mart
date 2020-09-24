import state from './firebase/state'
import getters from './firebase/getters'
import mutations from './firebase/mutations'
import actions from './firebase/actions'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}