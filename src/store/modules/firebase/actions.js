import firebase from 'firebase'
import { USER_REF, SELL_REF, BUY_REF, NOTICE_REF, LIST_REF, COMMENT_REF, COUNT_REF } from '@/config/firebase/ref'
import { TYPE, TYPE_TEXT, STATUS, STATUS_TEXT } from '@/config/library'
import { CURRENT_TIME, INCREMENT, DELETE, ARRAY_UNION } from '@/config/firebase/util'

export default {
  // ------------------------------------- 「求める」関連の処理 -------------------------------------

  // reference取得
  async getBuyListRef ({ dispatch, commit, getters, rootGetters }, payload) {
    const buyRef = BUY_REF().doc(rootGetters['auth/user'].uid)
    return await buyRef.get().then(function(doc) {
      return doc.data()
    })
  },
  // リアルタイム監視登録
  async setBuyListListener ({ dispatch, commit, getters, rootGetters }, payload) {
    const {id, index} = {...payload}
    const unsubscribe = LIST_REF().doc(id).onSnapshot(function (querySnapshot) {
      const newData = querySnapshot.data()
      const item = {
        id: newData.id,
        status: newData.status,
        name: newData.name,
        price: newData.price,
        reply: newData.reply,
      }
      commit('setBuyList', { index, item })

      // リスナーを停止
      if (newData.status === STATUS.FINISH) {
        unsubscribe()
      }
    })
  },
  // リスト取得
  async getBuyList ({ dispatch, commit, getters, rootGetters }, payload) {
    const refData = await dispatch('getBuyListRef')

    // 初期化
    ;(v => {
      for (let i=1; i<=refData.count; i++) {
        const item = {
          id: '',
          status: STATUS.NOT_RECRUITING,
          name: '',
          price: '',
          reply: 0
        }
        commit('setBuyList', { index: i, item })
      }
    })()

    // 実データ取得
    const getData = async (items, index) => {
      const item = await items[index].get()
      return {
        key: index,
        value: item
      }
    }

    // 非同期まとめて格納
    const promises = []
    for(const index in refData.items) {
      promises.push(getData(refData.items, index))
    }

    // 非同期まとめて処理
    Promise.all(promises).then(items => {
      for(const data of items){
        const index = data.key
        const item = {
          id: data.value.data().id,
          status: data.value.data().status,
          name: data.value.data().name,
          price: data.value.data().price,
          reply: data.value.data().reply
        }
        commit('setBuyList', { index, item })
        dispatch('setBuyListListener', {id: item.id, index})
      }
    })
  },
  // 新規登録
  async registerBuyList ({ dispatch, commit, getters, rootGetters }, payload) {
    const {item, index} = {...payload}

    const itemId = LIST_REF().doc().id
    const now = Math.floor( new Date().getTime() / 1000 )

    const buyRef = BUY_REF().doc(rootGetters['auth/user'].uid)
    const listRef = LIST_REF().doc(itemId)
    const commentRef = COMMENT_REF().doc(itemId)

    // 商品データ
    const itemData = {
      id: itemId,
      uid: rootGetters['auth/user'].uid,
      status: STATUS.UNDER_RECRUITING,
      name: item.name,
      price: item.price,
      type: TYPE.BUY,
      reply: 1,
      updated_at: CURRENT_TIME(),
      created_at: CURRENT_TIME()
    }
    // コメント構造
    const commentData = {
      item: listRef,
      reply: [
        {
          uid: rootGetters['auth/user'].uid,
          msg: '取引を開始しました。',
          created_at: now
        }
      ],
      good: 0,
      created_at: CURRENT_TIME(),
      updated_at: CURRENT_TIME()
    }
    // itemを一部上書き
    item.id = itemId
    item.reply = 1
    item.status = STATUS.UNDER_RECRUITING

    // 販売リスト更新(個人)
    await buyRef.update({
      ['items.' + index]: listRef
    })
    // 販売リスト更新(全体)
    await listRef.set({ ...itemData })
    // スレッド作成
    await commentRef.set({ ...commentData })
    // // リスナー登録
    dispatch('setBuyListListener', {id: item.id, index})
    commit('setBuyList', { index, item })
  },
  // 締め切る
  async closeBuyList ({ dispatch, commit, getters, rootGetters }, payload) {
    const {item, index} = {...payload}

    const now = Math.floor( new Date().getTime() / 1000 )

    const buyRef = BUY_REF().doc(rootGetters['auth/user'].uid)
    const listRef = LIST_REF().doc(item.id)
    const commentRef = COMMENT_REF().doc(item.id)

    // 商品データ
    const itemData = {
      reply: INCREMENT(1),
      status: STATUS.FINISH,
      updated_at: CURRENT_TIME()
    }
    // コメント構造
    const commentData = {
      uid: rootGetters['auth/user'].uid,
      msg: '取引を締め切りました。',
      created_at: now
    }
    // 販売リスト更新(個人)
    await buyRef.update({
      ['items.' + index]: DELETE()
    })
    // 販売リスト更新(全体)
    await listRef.update({
      ...itemData 
    })
    // チャット更新
    await commentRef.update({
      reply: ARRAY_UNION(commentData)
    })

    // itemを初期化
    item.id = ''
    item.status = STATUS.NOT_RECRUITING
    item.name = ''
    item.price = ''
    item.reply = 0

    // 出品枠を空に
    commit('setBuyList', { index, item })
  },
  // 価格変更
  async setBuyListPrice ({ dispatch, commit, getters, rootGetters }, payload) {
    const {item, index, newPrice} = {...payload}
    const listRef = LIST_REF().doc(item.id)
    const commentRef = COMMENT_REF().doc(item.id)
    const now = Math.floor( new Date().getTime() / 1000 )

    const itemData = {
      price: newPrice,
      updated_at: CURRENT_TIME(),
      reply: INCREMENT(1)
    }

    const commentData = {
      uid: rootGetters['auth/user'].uid,
      msg: `価格の変更を行いました。<br>${item.price} → 【${newPrice}】`,
      created_at: now
    }
    // 販売リスト更新(全体)
    await listRef.update({
       ...itemData 
    })
    // 値段変更通知
    await commentRef.update({
      reply: ARRAY_UNION(commentData)
    })
  },

  // ------------------------------------- 「出品する」関連の処理 -------------------------------------

  // reference取得
  async getSellListRef ({ dispatch, commit, getters, rootGetters }, payload) {
    const sellRef = SELL_REF().doc(rootGetters['auth/user'].uid)
    return await sellRef.get().then(function(doc) {
      return doc.data()
    })
  },
  // リアルタイム監視登録
  async setSellListListener ({ dispatch, commit, getters, rootGetters }, payload) {
    const {id, index} = {...payload}
    const unsubscribe = LIST_REF().doc(id).onSnapshot(function (querySnapshot) {
      const newData = querySnapshot.data()
      const item = {
        id: newData.id,
        status: newData.status,
        name: newData.name,
        price: newData.price,
        reply: newData.reply,
      }
      commit('setSellList', { index, item })

      // リスナーを停止
      if (newData.status === STATUS.FINISH) {
        unsubscribe()
      }
    })
  },
  // リスト取得
  async getSellList ({ dispatch, commit, getters, rootGetters }, payload) {
    const refData = await dispatch('getSellListRef')

    // 初期化
    ;(v => {
      for (let i=1; i<=refData.count; i++) {
        const item = {
          id: '',
          status: STATUS.NOT_RECRUITING,
          name: '',
          price: '',
          reply: 0
        }
        commit('setSellList', { index: i, item })
      }
    })()

    // 実データ取得
    const getData = async (items, index) => {
      const item = await items[index].get()
      return {
        key: index,
        value: item
      }
    }

    // 非同期まとめて格納
    const promises = []
    for(const index in refData.items) {
      promises.push(getData(refData.items, index))
    }

    // 非同期まとめて処理
    Promise.all(promises).then(items => {
      for(const data of items){
        const index = data.key
        const item = {
          id: data.value.data().id,
          status: data.value.data().status,
          name: data.value.data().name,
          price: data.value.data().price,
          reply: data.value.data().reply
        }
        commit('setSellList', { index, item })
        dispatch('setSellListListener', {id: item.id, index})
      }
    })
  },
  // 新規登録
  async registerSellList ({ dispatch, commit, getters, rootGetters }, payload) {
    const {item, index} = {...payload}

    const itemId = LIST_REF().doc().id
    const now = Math.floor( new Date().getTime() / 1000 )

    const sellRef = SELL_REF().doc(rootGetters['auth/user'].uid)
    const listRef = LIST_REF().doc(itemId)
    const commentRef = COMMENT_REF().doc(itemId)

    // 商品データ
    const itemData = {
      id: itemId,
      uid: rootGetters['auth/user'].uid,
      status: STATUS.UNDER_RECRUITING,
      name: item.name,
      price: item.price,
      type: TYPE.SELL,
      reply: 1,
      updated_at: CURRENT_TIME(),
      created_at: CURRENT_TIME()
    }
    // コメント構造
    const commentData = {
      item: listRef,
      reply: [
        {
          uid: rootGetters['auth/user'].uid,
          msg: '取引を開始しました。',
          created_at: now
        }
      ],
      good: 0,
      created_at: CURRENT_TIME(),
      updated_at: CURRENT_TIME()
    }
    // itemを一部上書き
    item.id = itemId
    item.reply = 1
    item.status = STATUS.UNDER_RECRUITING

    // 販売リスト更新(個人)
    await sellRef.update({
      ['items.' + index]: listRef
    })
    // 販売リスト更新(全体)
    await listRef.set({ ...itemData })
    // スレッド作成
    await commentRef.set({ ...commentData })
    // // リスナー登録
    dispatch('setSellListListener', {id: item.id, index})
    commit('setSellList', { index, item })
  },
  // 締め切る
  async closeSellList ({ dispatch, commit, getters, rootGetters }, payload) {
    const {item, index} = {...payload}

    const now = Math.floor( new Date().getTime() / 1000 )

    const sellRef = SELL_REF().doc(rootGetters['auth/user'].uid)
    const listRef = LIST_REF().doc(item.id)
    const commentRef = COMMENT_REF().doc(item.id)

    // 商品データ
    const itemData = {
      reply: INCREMENT(1),
      status: STATUS.FINISH,
      updated_at: CURRENT_TIME()
    }
    // コメント構造
    const commentData = {
      uid: rootGetters['auth/user'].uid,
      msg: '取引を締め切りました。',
      created_at: now
    }
    // 販売リスト更新(個人)
    await sellRef.update({
      ['items.' + index]: DELETE()
    })
    // 販売リスト更新(全体)
    await listRef.update({
      ...itemData 
    })
    // チャット更新
    await commentRef.update({
      reply: ARRAY_UNION(commentData)
    })

    // itemを初期化
    item.id = ''
    item.status = STATUS.NOT_RECRUITING
    item.name = ''
    item.price = ''
    item.reply = 0

    // 出品枠を空に
    commit('setSellList', { index, item })
  },
  // 価格変更
  async setSellListPrice ({ dispatch, commit, getters, rootGetters }, payload) {
    const {item, index, newPrice} = {...payload}
    const listRef = LIST_REF().doc(item.id)
    const commentRef = COMMENT_REF().doc(item.id)
    const now = Math.floor( new Date().getTime() / 1000 )

    const itemData = {
      price: newPrice,
      updated_at: CURRENT_TIME(),
      reply: INCREMENT(1)
    }

    const commentData = {
      uid: rootGetters['auth/user'].uid,
      msg: `価格の変更を行いました。<br>${item.price} → 【${newPrice}】`,
      created_at: now
    }
    // 販売リスト更新(全体)
    await listRef.update({
       ...itemData 
    })
    // 値段変更通知
    await commentRef.update({
      reply: ARRAY_UNION(commentData)
    })
  },

  // ------------------------------------- 「取引一覧」関連の処理 -------------------------------------

  // リスト取得
  async getList ({ dispatch, commit, getters, rootGetters }, payload) {
    const {limit, lastUpdatedAt} = {...payload}
    const query = !lastUpdatedAt
      ? LIST_REF().orderBy('updated_at', 'desc').limit(limit)
      : LIST_REF().orderBy('updated_at', 'desc').startAt(lastUpdatedAt).limit(limit)
    await query.get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        const id = doc.id
        const item = doc.data()
        commit('setList', { id, item })
      })
    })
  },
  async getListBySearch ({ dispatch, commit, getters, rootGetters }, payload) {
    const {title, limit} = {...payload}
    const query = LIST_REF().orderBy('name').orderBy('updated_at', 'desc').startAt(title).endAt(title+'\uf8ff').limit(limit)
    await query.get().then(function(querySnapshot) {
      commit('resetListBySearch')
      querySnapshot.forEach(function(doc) {
        const id = doc.id
        const item = doc.data()
        commit('setListBySearch', { id, item })
      })
    })
  },
  // 最新の1件をリアルタイム監視登録
  async setListListener ({ dispatch, commit, getters, rootGetters }, payload) {
    LIST_REF().orderBy('updated_at', 'desc').limit(1).onSnapshot(function (querySnapshot) {
      querySnapshot.forEach(function(doc) {
        const id = doc.id
        const item = doc.data()
        commit('setList', { id, item })
      })
    })
  },
  // 最新の1件をリアルタイム監視登録
  async setListCountListener ({ dispatch, commit, getters, rootGetters }, payload) {
    COUNT_REF().doc('lists').onSnapshot(function (doc) {
      const count = doc.data()
      commit('setCount', { type: 'lists', count: count.num })
    })
  },
  async RefreshCommentList ({ dispatch, commit, getters, rootGetters }, payload) {
    const commentRef = COMMENT_REF().doc(payload.itemId)
    return await commentRef.get().then(function(doc) {
      return doc.data()
    })
  },
  async RefreshSellList ({ dispatch, commit, getters, rootGetters }, payload) {
    const sellRef = SELL_REF().doc(rootGetters['auth/user'].uid)
    return await sellRef.get().then(function(doc) {
      return doc.data()
    })
  }
}