importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// Config này y chang file src/app/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyAR2nx3mMMJQ9NYoJkfZnpqV646oiMuhTU",
  authDomain: "planbookai-77e07.firebaseapp.com",
  projectId: "planbookai-77e07",
  storageBucket: "planbookai-77e07.firebasestorage.app",
  messagingSenderId: "275614582956",
  appId: "1:275614582956:web:f8344290ca0205e768b709",
  measurementId: "G-ZV6VWPM0SP"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Lắng nghe tin nhắn khi người dùng thu nhỏ trình duyệt / đóng tab
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Lính canh đã bắt được tín hiệu ngầm: ', payload);
  
  const notificationTitle = payload.notification.title || "PlanbookAI Thông Báo";
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
