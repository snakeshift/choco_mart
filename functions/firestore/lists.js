const admin = require('firebase-admin')
const functions = require('firebase-functions')

const db = admin.firestore()
const f = functions.region('asia-northeast1')

exports.onCreate = f.firestore.document('lists/{itemId}').onCreate((snapshot, context) => {
  // 登録時に件数をインクリメント
  const FieldValue = admin.firestore.FieldValue
  return db.doc('counts/lists').update({num: FieldValue.increment(1)})
})