importScripts('https://www.gstatic.com/firebasejs/7.8.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/7.8.0/firebase-messaging.js')

firebase.initializeApp({
  apiKey: "AIzaSyD8t5QJEMKbg5RYoPN48zk7Kjth6Hb0fxM",
  authDomain: "choco-mart.firebaseapp.com",
  databaseURL: "https://choco-mart.firebaseio.com",
  projectId: "choco-mart",
  storageBucket: "choco-mart.appspot.com",
  messagingSenderId: "779047029524",
  appId: "1:779047029524:web:c37d738044284f727b5001",
  measurementId: "G-2PDBMYBW5Z"
})

const messaging = firebase.messaging()
messaging.setBackgroundMessageHandler(function(payload) {
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    title: payload.notification.title,
    icon: '/mohu.png'
  }
  return self.registration.showNotification(notificationTitle, notificationOptions)
})
