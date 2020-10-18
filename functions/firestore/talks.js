const admin = require('firebase-admin')
const functions = require('firebase-functions')

const db = admin.firestore()
const f = functions.region('asia-northeast1')

exports.onCreate = f.firestore.document('talks/{itemId}').onCreate((snapshot, context) => {
  // 登録時に件数をインクリメント
  const FieldValue = admin.firestore.FieldValue
  return db.doc('counts/talks').update({num: FieldValue.increment(1)})
})

exports.sendPushMessage = f.firestore.document('talks/{itemId}').onWrite(async (change, context) => {
  const talkData = change.after.data()
  const commentRef = await admin
    .firestore()
    .collection('comments')
    .doc(talkData.id)
  
  const comment = await commentRef.get()
  const commentData = comment.data()

  // 通知登録先がいなければスキップ
  if (!commentData.pushUserList || commentData.pushUserList.length <= 0) return true

  // push通知内容
  const payload = {
    notification: {
      title: talkData.title,
      body: commentData.reply[commentData.reply.length - 1].msg,
      icon: '/mohu.png'
    }
  }

  // トークンリスト
  const userTokenList = []

  // ユーザーデータ取得
  const getUserToken = async (userId) => {
    const userRef = await admin
      .firestore()
      .collection('users')
      .doc(userId)
    const userDoc = await userRef.get()
    const user = userDoc.data()
    if (user.token) userTokenList.push(user.token)
  }

  // 非同期まとめて格納
  const promises = []
  for(const userId of commentData.pushUserList) {
    // 書き込んだ本人には通知を送らない
    if (talkData.last_updated_by === userId) continue
    promises.push(getUserToken(userId))
  }

  // 非同期まとめて処理
  Promise.all(promises).then(result => {
    for(const token of userTokenList){
      if (token) {
        // プッシュ通知を送信
        admin.messaging().sendToDevice(token, payload)
      }
    }
    return true
  }).catch(() => {
    return true
  })
  return true
})