import firebase from 'firebase'

const USER_REF = () => firebase.firestore().collection('users')
const SELL_REF = () => firebase.firestore().collection('sells')
const BUY_REF = () => firebase.firestore().collection('buys')
const NOTICE_REF = () => firebase.firestore().collection('notices')
const COMMENT_REF = () => firebase.firestore().collection('comments')
const LIST_REF = () => firebase.firestore().collection('lists')
const COUNT_REF = () => firebase.firestore().collection('counts')

export {
  USER_REF,
  SELL_REF,
  BUY_REF,
  NOTICE_REF,
  COMMENT_REF,
  LIST_REF,
  COUNT_REF
}