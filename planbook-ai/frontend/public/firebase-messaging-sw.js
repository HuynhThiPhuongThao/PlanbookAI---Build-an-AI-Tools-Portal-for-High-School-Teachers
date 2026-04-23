/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAR2nx3mMMJQ9NYoJkfZnpqV646oiMuhTU",
  authDomain: "planbookai-77e07.firebaseapp.com",
  projectId: "planbookai-77e07",
  storageBucket: "planbookai-77e07.firebasestorage.app",
  messagingSenderId: "275614582956",
  appId: "1:275614582956:web:f8344290ca0205e768b709"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Đã nhận tin nhắn chạy ngầm: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg' 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
