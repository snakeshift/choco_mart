import firebase from 'firebase'

const CURRENT_TIME = () => firebase.firestore.FieldValue.serverTimestamp()
const INCREMENT = index => firebase.firestore.FieldValue.increment(index)
const DELETE = index => firebase.firestore.FieldValue.delete()
const ARRAY_UNION = data => firebase.firestore.FieldValue.arrayUnion(data)


export {
  CURRENT_TIME,
  INCREMENT,
  DELETE,
  ARRAY_UNION
}