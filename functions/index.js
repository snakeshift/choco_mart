const admin = require('firebase-admin')
admin.initializeApp()

const users = require('./firestore/users')
const lists = require('./firestore/lists')

exports.users = users
exports.lists = lists

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
