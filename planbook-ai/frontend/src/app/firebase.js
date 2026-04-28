// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAR2nx3mMMJQ9NYoJkfZnpqV646oiMuhTU",
  authDomain: "planbookai-77e07.firebaseapp.com",
  projectId: "planbookai-77e07",
  storageBucket: "planbookai-77e07.firebasestorage.app",
  messagingSenderId: "275614582956",
  appId: "1:275614582956:web:f8344290ca0205e768b709",
  measurementId: "G-ZV6VWPM0SP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Xin quyền bật thông báo từ trình duyệt
export const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('User đã cho phép gửi thông báo!');
      const token = await getToken(messaging, { vapidKey: "BD3ka1DgeqSOMs9Y9cPZgWcnc2P1mw1L48fMPmxWn177qtg4FxP6gY5KiUrrl-60WUOV96Dg3JyoDYAGq0ZLjfo" });
      console.log('Firebase Token:', token);
      return token;
    }
  } catch (error) {
    console.error('Lỗi lấy quyền:', error);
  }
};

// Lắng nghe thông báo khi người dùng đang mở web.
export const listenForMessage = (onPayloadReceived) => {
  onMessage(messaging, (payload) => {
    console.log("Nhận thông báo Firebase:", payload);
    onPayloadReceived(payload);
  });
};
