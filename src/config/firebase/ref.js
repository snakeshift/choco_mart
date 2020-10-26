import firebase from 'firebase'

// Firestore
const USER_REF = () => firebase.firestore().collection('users')
const SELL_REF = () => firebase.firestore().collection('sells')
const BUY_REF = () => firebase.firestore().collection('buys')
const NOTICE_REF = () => firebase.firestore().collection('notices')
const COMMENT_REF = () => firebase.firestore().collection('comments')
const LIST_REF = () => firebase.firestore().collection('lists')
const TALK_REF = () => firebase.firestore().collection('talks')
const COUNT_REF = () => firebase.firestore().collection('counts')

// Cloud Storage
const STORAGE_REF = () => firebase.storage()

export {
  USER_REF,
  SELL_REF,
  BUY_REF,
  NOTICE_REF,
  COMMENT_REF,
  LIST_REF,
  TALK_REF,
  COUNT_REF,
  STORAGE_REF
}