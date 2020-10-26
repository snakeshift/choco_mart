import firebase from 'firebase'
import nGram from 'n-gram'
import { USER_REF, SELL_REF, BUY_REF, NOTICE_REF, LIST_REF, TALK_REF, COMMENT_REF, COUNT_REF } from '@/config/firebase/ref'
import { TYPE, TYPE_TEXT, STATUS, STATUS_TEXT, COMMENT_TYPE, TARGET_OS, SEARCH_TYPE } from '@/config/library'
import { CURRENT_TIME, INCREMENT, DELETE, ARRAY_UNION, ARRAY_REMOVE } from '@/config/firebase/util'

export default {
  // ------------------------------------- 「求める」関連の処理 -------------------------------------

  // reference取得
  async getBuyListRef ({ dispatch, commit, getters, rootGetters }, payload) {
    const {userId} = {...payload}
    const buyRef = BUY_REF().doc(userId)
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
        updated_at: newData.updated_at
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
    const refData = await dispatch('getBuyListRef', {userId: rootGetters['auth/user'].uid})

    // 初期化
    ;(v => {
      for (let i=1; i<=refData.count; i++) {
        const item = {
          id: '',
          status: STATUS.NOT_RECRUITING,
          name: '',
          price: '',
          reply: 0,
          updated_at: {
            nanoseconds: 0,
            seconds: 0
          }
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
          reply: data.value.data().reply,
          updated_at: data.value.data().updated_at
        }
        commit('setBuyList', { index, item })
        dispatch('setBuyListListener', {id: item.id, index})
      }
    })
  },
  // 新規登録
  async registerBuyList ({ dispatch, commit, getters, rootGetters }, payload) {
    const {item, index, target} = {...payload}

    const itemId = LIST_REF().doc().id
    const now = Math.floor( new Date().getTime() / 1000 )

    const buyRef = BUY_REF().doc(rootGetters['auth/user'].uid)
    const listRef = LIST_REF().doc(itemId)
    const commentRef = COMMENT_REF().doc(itemId)

    const targetOs = target === TARGET_OS.BOTH ? '【SP/PC可能】' : target === TARGET_OS.SP ? '【SPのみ】' : '【PCのみ】'

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
      created_at: CURRENT_TIME(),
      last_updated_by: rootGetters['auth/user'].uid,
      dictionary: nGram.trigram(item.name)
    }
    // コメント構造
    const commentData = {
      item: listRef,
      reply: [
        {
          uid: rootGetters['auth/user'].uid,
          msg: `${targetOs}\n  取引を開始しました。`,
          created_at: now
        }
      ],
      pushUserList: [],
      good: 0,
      created_at: CURRENT_TIME(),
      updated_at: CURRENT_TIME()
    }
    // itemを一部上書き
    item.id = itemId
    item.reply = 1
    item.status = STATUS.UNDER_RECRUITING

    const promises = [
      // 販売リスト更新(個人)
      buyRef.update({
        ['items.' + index]: listRef
      }),
      // 販売リスト更新(全体)
      listRef.set({ ...itemData }),
      // スレッド作成
      commentRef.set({ ...commentData })
    ]

    Promise.all(promises).then(items => {
      // リスナー登録
      dispatch('setBuyListListener', {id: item.id, index})
      commit('setBuyList', { index, item })
    }).catch(() => {
      commit('modal/setIsShowError', true, { root: true })
      commit('modal/setStatusMsg', 'データの更新に失敗しました。', { root: true })
    })
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
      updated_at: CURRENT_TIME(),
      last_updated_by: rootGetters['auth/user'].uid
    }
    // コメント構造
    const commentData = {
      uid: rootGetters['auth/user'].uid,
      msg: '取引を締め切りました。',
      created_at: now
    }
    const promises = [
      // 販売リスト更新(個人)
      buyRef.update({
        ['items.' + index]: DELETE()
      }),
      // 販売リスト更新(全体)
      listRef.update({
        ...itemData 
      }),
      // チャット更新
      commentRef.update({
        reply: ARRAY_UNION(commentData)
      })
    ]

    Promise.all(promises).then(items => {
      // itemを初期化
      item.id = ''
      item.status = STATUS.NOT_RECRUITING
      item.name = ''
      item.price = ''
      item.reply = 0
      // 出品枠を空に
      commit('setBuyList', { index, item })
    }).catch(() => {
      commit('modal/setIsShowError', true, { root: true })
      commit('modal/setStatusMsg', 'データの更新に失敗しました。', { root: true })
    })
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
      reply: INCREMENT(1),
      last_updated_by: rootGetters['auth/user'].uid
    }

    const commentData = {
      uid: rootGetters['auth/user'].uid,
      msg: `価格の変更を行いました。<br>${item.price} → 【${newPrice}】`,
      created_at: now
    }

    const promises = [
      // 販売リスト更新(全体)
      listRef.update({
        ...itemData 
      }),
      // 値段変更通知
      commentRef.update({
        reply: ARRAY_UNION(commentData)
      })
    ]

    Promise.all(promises).catch(() => {
      commit('modal/setIsShowError', true, { root: true })
      commit('modal/setStatusMsg', 'データの更新に失敗しました。', { root: true })
    })
  },

  // ------------------------------------- 「出品する」関連の処理 -------------------------------------

  // reference取得
  async getSellListRef ({ dispatch, commit, getters, rootGetters }, payload) {
    const {userId} = {...payload}
    const sellRef = SELL_REF().doc(userId)
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
        updated_at: newData.updated_at
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
    const refData = await dispatch('getSellListRef', {userId: rootGetters['auth/user'].uid})

    // 初期化
    ;(v => {
      for (let i=1; i<=refData.count; i++) {
        const item = {
          id: '',
          status: STATUS.NOT_RECRUITING,
          name: '',
          price: '',
          reply: 0,
          updated_at: {
            nanoseconds: 0,
            seconds: 0
          }
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
          reply: data.value.data().reply,
          updated_at: data.value.data().updated_at
        }
        commit('setSellList', { index, item })
        dispatch('setSellListListener', {id: item.id, index})
      }
    })
  },
  // 新規登録
  async registerSellList ({ dispatch, commit, getters, rootGetters }, payload) {
    const {item, index, target} = {...payload}

    const itemId = LIST_REF().doc().id
    const now = Math.floor( new Date().getTime() / 1000 )

    const sellRef = SELL_REF().doc(rootGetters['auth/user'].uid)
    const listRef = LIST_REF().doc(itemId)
    const commentRef = COMMENT_REF().doc(itemId)

    const targetOs = target === TARGET_OS.BOTH ? '【SP/PC可能】' : target === TARGET_OS.SP ? '【SPのみ】' : '【PCのみ】'

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
      created_at: CURRENT_TIME(),
      last_updated_by: rootGetters['auth/user'].uid,
      dictionary: nGram.trigram(item.name)
    }
    // コメント構造
    const commentData = {
      item: listRef,
      reply: [
        {
          uid: rootGetters['auth/user'].uid,
          msg: `${targetOs}\n  取引を開始しました。`,
          created_at: now
        }
      ],
      pushUserList: [],
      good: 0,
      created_at: CURRENT_TIME(),
      updated_at: CURRENT_TIME()
    }
    // itemを一部上書き
    item.id = itemId
    item.reply = 1
    item.status = STATUS.UNDER_RECRUITING

    const promises = [
      // 販売リスト更新(個人)
      sellRef.update({
        ['items.' + index]: listRef
      }),
      // 販売リスト更新(全体)
      listRef.set({ ...itemData }),
      // スレッド作成
      commentRef.set({ ...commentData })
    ]

    Promise.all(promises).then(items => {
      // リスナー登録
      dispatch('setSellListListener', {id: item.id, index})
      commit('setSellList', { index, item })
    }).catch(() => {
      commit('modal/setIsShowError', true, { root: true })
      commit('modal/setStatusMsg', 'データの更新に失敗しました。', { root: true })
    })
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
      updated_at: CURRENT_TIME(),
      last_updated_by: rootGetters['auth/user'].uid
    }
    // コメント構造
    const commentData = {
      uid: rootGetters['auth/user'].uid,
      msg: '取引を締め切りました。',
      created_at: now
    }

    const promises = [
      // 販売リスト更新(個人)
      sellRef.update({
        ['items.' + index]: DELETE()
      }),
      // 販売リスト更新(全体)
      listRef.update({
        ...itemData 
      }),
      // チャット更新
      commentRef.update({
        reply: ARRAY_UNION(commentData)
      })
    ]

    Promise.all(promises).then(items => {
      // itemを初期化
      item.id = ''
      item.status = STATUS.NOT_RECRUITING
      item.name = ''
      item.price = ''
      item.reply = 0
      // 出品枠を空に
      commit('setSellList', { index, item })
    }).catch(() => {
      commit('modal/setIsShowError', true, { root: true })
      commit('modal/setStatusMsg', 'データの更新に失敗しました。', { root: true })
    })
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
      reply: INCREMENT(1),
      last_updated_by: rootGetters['auth/user'].uid
    }

    const commentData = {
      uid: rootGetters['auth/user'].uid,
      msg: `価格の変更を行いました。<br>${item.price} → 【${newPrice}】`,
      created_at: now
    }

    const promises = [
      // 販売リスト更新(全体)
      listRef.update({
        ...itemData 
      }),
      // 値段変更通知
      commentRef.update({
        reply: ARRAY_UNION(commentData)
      })
    ]

    Promise.all(promises).catch(() => {
      commit('modal/setIsShowError', true, { root: true })
      commit('modal/setStatusMsg', 'データの更新に失敗しました。', { root: true })
    })
  },

  // ------------------------------------- 「取引一覧」関連の処理 -------------------------------------

  // リスト取得
  async getList ({ dispatch, commit, getters, rootGetters }, payload) {
    const {limit, lastUpdatedAt, filter} = {...payload}
    let query
    if (!filter) {
      query = !lastUpdatedAt
        ? LIST_REF().where('status','==',STATUS.UNDER_RECRUITING).orderBy('updated_at', 'desc').limit(limit)
        : LIST_REF().where('status','==',STATUS.UNDER_RECRUITING).orderBy('updated_at', 'desc').startAt(lastUpdatedAt).limit(limit)
    } else {
      query = !lastUpdatedAt
        ? LIST_REF().where('type','==',filter).where('status','==',STATUS.UNDER_RECRUITING).orderBy('updated_at', 'desc').limit(limit)
        : LIST_REF().where('type','==',filter).where('status','==',STATUS.UNDER_RECRUITING).orderBy('updated_at', 'desc').startAt(lastUpdatedAt).limit(limit)
    }
    await query.get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        const id = doc.id
        const item = doc.data()
        commit('setList', { id, item })
      })
    })
  },
  async getListBySearch ({ dispatch, commit, getters, rootGetters }, payload) {
    const {title, limit, searchType} = {...payload}

    if (searchType === SEARCH_TYPE.PARTIAL) {
      const query = LIST_REF().where('dictionary', 'array-contains-any', nGram.trigram(title)).orderBy('updated_at', 'desc').limit(limit)
      await query.get().then(function(querySnapshot) {
        commit('resetListBySearch')
        querySnapshot.forEach(function(doc) {
          const id = doc.id
          const item = doc.data()
          commit('setListBySearch', { id, item })
        })
      })
    } else {
      const query = LIST_REF().orderBy('name').orderBy('updated_at', 'desc').startAt(title).endAt(title+'\uf8ff').limit(limit)
      await query.get().then(function(querySnapshot) {
        commit('resetListBySearch')
        querySnapshot.forEach(function(doc) {
          const id = doc.id
          const item = doc.data()
          commit('setListBySearch', { id, item })
        })
      })
    }
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
  // カウンター監視登録
  async setListCountListener ({ dispatch, commit, getters, rootGetters }, payload) {
    COUNT_REF().doc('lists').onSnapshot(function (doc) {
      const count = doc.data()
      commit('setCount', { type: 'lists', count: count.num })
    })
  },

  // ------------------------------------- 「雑談」関連の処理 -------------------------------------

  // リスト取得
  async getTalkList ({ dispatch, commit, getters, rootGetters }, payload) {
    const {limit, lastUpdatedAt} = {...payload}
    const query = !lastUpdatedAt
      ? TALK_REF().orderBy('updated_at', 'desc').limit(limit)
      : TALK_REF().orderBy('updated_at', 'desc').startAt(lastUpdatedAt).limit(limit)
    await query.get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        const id = doc.id
        const item = doc.data()
        commit('setTalkList', { id, item })
      })
    })
  },
  // 最新の1件をリアルタイム監視登録
  async setTalkListListener ({ dispatch, commit, getters, rootGetters }, payload) {
    TALK_REF().orderBy('updated_at', 'desc').limit(1).onSnapshot(function (querySnapshot) {
      querySnapshot.forEach(function(doc) {
        const id = doc.id
        const item = doc.data()
        commit('setTalkList', { id, item })
      })
    })
  },
  // カウンター監視登録
  async setTalkListCountListener ({ dispatch, commit, getters, rootGetters }, payload) {
    COUNT_REF().doc('talks').onSnapshot(function (doc) {
      const count = doc.data()
      commit('setCount', { type: 'talks', count: count.num })
    })
  },
  // 新規登録
  async registerTalkList ({ dispatch, commit, getters, rootGetters }, payload) {
    const {title, content, type} = {...payload}

    const itemId = TALK_REF().doc().id
    const now = Math.floor( new Date().getTime() / 1000 )

    const talkRef = TALK_REF().doc(itemId)
    const commentRef = COMMENT_REF().doc(itemId)
    const name = rootGetters['auth/user'].displayName ? rootGetters['auth/user'].displayName : '名も無き冒険者'

    // 商品データ
    const itemData = {
      id: itemId,
      uid: rootGetters['auth/user'].uid,
      status: STATUS.UNDER_RECRUITING,
      title,
      name,
      type,
      reply: 1,
      updated_at: CURRENT_TIME(),
      created_at: CURRENT_TIME(),
      last_updated_by: rootGetters['auth/user'].uid
    }

    // コメント構造
    const commentData = {
      item: talkRef,
      reply: [
        {
          uid: rootGetters['auth/user'].uid,
          msg: content,
          created_at: now
        }
      ],
      pushUserList: [],
      good: 0,
      created_at: CURRENT_TIME(),
      updated_at: CURRENT_TIME()
    }

    const promises = [
      // 販売リスト更新(全体)
      talkRef.set({ ...itemData }),
      // スレッド作成
      commentRef.set({ ...commentData })
    ]

    Promise.all(promises).catch(() => {
      commit('modal/setIsShowError', true, { root: true })
      commit('modal/setStatusMsg', 'データの更新に失敗しました。', { root: true })
    })
  },

  // ------------------------------------- 「コメント」関連の処理 -------------------------------------

  // リスト取得
  async getCommentList ({ dispatch, commit, getters, rootGetters }, payload) {
    const {itemId, kind} = {...payload}
    const commentRef = COMMENT_REF().doc(itemId)
    await commentRef.get().then(async function(doc) {
      const item = doc.data()
      const talkOrListRef = kind === COMMENT_TYPE.LIST
        ? LIST_REF().doc(itemId)
        : TALK_REF().doc(itemId)
      const itemData = await talkOrListRef.get()
      item.item = itemData.data()
      commit('setCommentList', { item })
    })
  },

  async getTalkMemberList ({ dispatch, commit, getters, rootGetters }, payload) {
    const reply = getters.commentList.reply

    // 実データ取得
    const getData = async (userId) => {
      const userData = await dispatch('auth/getUserById', {userId}, { root: true })
      return {id: userId, userData }
    }

    // 非同期まとめて格納
    const promises = []
    const userIds = []
    for(const content of reply) {
      // 同じトークを開いている限りはキャッシュ利用、それ以外は最初から取得 / 自分の場合は関数を呼ぶたびに再取得 (アイコン変更検知)
      if(content.uid === rootGetters['auth/user'].uid) {
        if(userIds.includes(content.uid)) continue
      } else if (userIds.includes(content.uid) || content.uid in getters['talkMemberList']){
        continue
      }
      promises.push(getData(content.uid))
      userIds.push(content.uid)
    }

    // 非同期まとめて処理
    await Promise.all(promises).then(users => {
      for(const user of users) {
        commit('setTalkMemberList', { id: user.id, userData: user.userData })
      }
    })
  },

  async getUserTradeList ({ dispatch, commit, getters, rootGetters }, payload) {
    // 初期化
    commit('resetTalkMemberTradeList')

    const {userId} = {...payload}
    const buyRefData = await dispatch('getBuyListRef', {userId})
    const sellRefData = await dispatch('getSellListRef', {userId})

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
    for(const index in buyRefData.items) {
      promises.push(getData(buyRefData.items, index))
    }
    for(const index in sellRefData.items) {
      promises.push(getData(sellRefData.items, index))
    }

    // 非同期まとめて処理
    Promise.all(promises).then(items => {
      for(const data of items){
        const item = {
          id: data.value.data().id,
          status: data.value.data().status,
          name: data.value.data().name,
          price: data.value.data().price,
          reply: data.value.data().reply,
          type: data.value.data().type
        }
        const type = item.type === TYPE.BUY ? 'buys' : 'sells'
        commit('setTalkMemberTradeList', { type, item })
      }
    })
  },

  async registerGood ({ dispatch, commit, getters, rootGetters }, payload) {
    const {itemId, kind} = {...payload}
    const noticeRef = NOTICE_REF().doc(rootGetters['auth/user'].uid)
    const commentRef = COMMENT_REF().doc(itemId)
    const talkOrListRef = kind === COMMENT_TYPE.LIST
      ? LIST_REF().doc(itemId)
      : TALK_REF().doc(itemId)

    const commentData = {
      updated_at: CURRENT_TIME(),
      good: INCREMENT(1),
      pushUserList: ARRAY_UNION(rootGetters['auth/user'].uid)
    }
    await noticeRef.update({
      items: ARRAY_UNION(talkOrListRef)
    })
    await commentRef.update({
       ...commentData 
    })
  },

  async removeGood ({ dispatch, commit, getters, rootGetters }, payload) {
    const {itemId, kind} = {...payload}
    const noticeRef = NOTICE_REF().doc(rootGetters['auth/user'].uid)
    const commentRef = COMMENT_REF().doc(itemId)
    const talkOrListRef = kind === COMMENT_TYPE.LIST
      ? LIST_REF().doc(itemId)
      : TALK_REF().doc(itemId)

    const commentData = {
      updated_at: CURRENT_TIME(),
      good: INCREMENT(-1),
      pushUserList: ARRAY_REMOVE(rootGetters['auth/user'].uid)
    }
    await noticeRef.update({
      items: ARRAY_REMOVE(talkOrListRef)
    })
    await commentRef.update({
       ...commentData 
    })

  },

  async registerComment({ dispatch, commit, getters, rootGetters }, payload){
    const {itemId, kind, message, imageUrl} = {...payload}
    const now = Math.floor( new Date().getTime() / 1000 )
    const commentRef = COMMENT_REF().doc(itemId)
    const talkOrListRef = kind === COMMENT_TYPE.LIST
      ? LIST_REF().doc(itemId)
      : TALK_REF().doc(itemId)

    const commentData = {
      uid: rootGetters['auth/user'].uid,
      msg: message,
      imageUrl: imageUrl,
      created_at: now
    }
    const itemData = {
      updated_at: CURRENT_TIME(),
      reply: INCREMENT(1),
      last_updated_by: rootGetters['auth/user'].uid
    }

    const promises = [
      commentRef.update({
        reply: ARRAY_UNION(commentData)
      }),
      talkOrListRef.update({
        ...itemData 
     })
    ]

    Promise.all(promises).catch(() => {
      commit('modal/setIsShowError', true, { root: true })
      commit('modal/setStatusMsg', 'データの更新に失敗しました。', { root: true })
    })
  },

  // ------------------------------------- 「お気に入り」関連の処理 -------------------------------------

  // reference取得
  async getNoticeListRef ({ dispatch, commit, getters, rootGetters }, payload) {
    const query = NOTICE_REF().doc(rootGetters['auth/user'].uid)
    return await query.get().then(function(doc) {
      return doc.data()
    })
  },
  // リスト取得 (リスナーと紐づいているため、初回のみ読み込み)
  async getNoticeList ({ dispatch, commit, getters, rootGetters }, payload) {
    const refData = await dispatch('getNoticeListRef')

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
    await Promise.all(promises).then(items => {
      for(const data of items){
        const id = data.value.data().id
        const kind = 'price' in data.value.data() ? COMMENT_TYPE.LIST : COMMENT_TYPE.TALK
        dispatch('setNoticeListener', { id, kind, isInit: true })
      }
    })
  },

  // お気に入りの各itemの監視
  async setNoticeListener ({ dispatch, commit, getters, rootGetters }, payload) {
    const {id, kind} = {...payload}
    let {isInit} = {...payload}
    const talkOrListRef = kind === COMMENT_TYPE.LIST
      ? LIST_REF().doc(id)
      : TALK_REF().doc(id)

    const unsubscribe = talkOrListRef.onSnapshot(function (querySnapshot) {
      const id = querySnapshot.data().id
      const item = querySnapshot.data()
      commit('setNoticeList', { id, item })
      if (item.last_updated_by !== rootGetters['auth/user'].uid && !isInit) {
        commit('plusBadge', { type: 'notices' })
      } else {
        isInit = false // Good以降は反応するように
      }
    })
    // リスナー停止用にstoreにセット
    commit('setListenerList', {type: 'notices', id, unsubscribe })
  },

  // お気に入りタブの増減の監視
  async watchNoticeList ({ dispatch, commit, getters, rootGetters }, payload) {
    NOTICE_REF().doc(rootGetters['auth/user'].uid).onSnapshot(function (querySnapshot) {
      const items = querySnapshot.data().items
      const notices = getters.listenerList.notices
      // 増えているか判別
      items.forEach(async function(item) {
        // idがまだリスナーに含まれていなければ追加
        if (!(item.id in notices)) {
          const data = await item.get()
          const id = data.data().id
          const kind = 'price' in data.data() ? COMMENT_TYPE.LIST : COMMENT_TYPE.TALK
          dispatch('setNoticeListener', {id, kind, isInit: true})
        }
      })
      // 減っているか判別
      for (const id in notices) {
        const item = items.find(item => item.id === id)
        // storeに存在するidがsnapshotに存在しない = 解除したアイテム
        if (!item) {
          commit('resetListenerList', {type: 'notices', id })
        }
      }
    })
  }
}