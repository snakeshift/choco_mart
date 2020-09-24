import firebase from 'firebase'

const CURRENT_TIME = () => firebase.firestore.FieldValue.serverTimestamp()

export {
  CURRENT_TIME
}