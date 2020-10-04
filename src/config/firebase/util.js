import firebase from 'firebase'

const CURRENT_TIME = () => firebase.firestore.FieldValue.serverTimestamp()
// const CURRENT_TIME = () => firebase.firestore.FieldValue.serverTimestamp() 時間差で二重課金されるので使用控えたい
const INCREMENT = index => firebase.firestore.FieldValue.increment(index)
const DELETE = index => firebase.firestore.FieldValue.delete()
const ARRAY_UNION = data => firebase.firestore.FieldValue.arrayUnion(data)
const ARRAY_REMOVE = data => firebase.firestore.FieldValue.arrayRemove(data)

export {
  CURRENT_TIME,
  INCREMENT,
  DELETE,
  ARRAY_UNION,
  ARRAY_REMOVE
}