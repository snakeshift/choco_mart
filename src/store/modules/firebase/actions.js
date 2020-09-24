import firebase from 'firebase'
import { USER_REF, SELL_REF, BUY_REF, NOTICE_REF, COMMENT_REF } from '@/config/firebase/ref'

export default {
  async RefreshSellList ({ dispatch, commit, getters, rootGetters }, payload) {
    const sellRef = SELL_REF().doc(rootGetters['auth/user'].uid)
    return await sellRef.get().then(function(doc) {
      return doc.data()
    })
  },
  async RefreshBuyList ({ dispatch, commit, getters, rootGetters }, payload) {
    const buyRef = BUY_REF().doc(rootGetters['auth/user'].uid)
    return await buyRef.get().then(function(doc) {
      return doc.data()
    })
  },
  async RefreshCommentList ({ dispatch, commit, getters, rootGetters }, payload) {
    const commentRef = COMMENT_REF().doc(payload.itemId)
    return await commentRef.get().then(function(doc) {
      return doc.data()
    })
  }
}