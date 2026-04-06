/* eslint-disable */
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

// NOTE:
// 이 서비스워커는 public 정적 파일이라 Vite의 import.meta.env를 직접 사용할 수 없음.
// Firebase 설정값 변경 시 src/firebase-config.ts와 함께 동일하게 수정해야 함.

// Firebase Config
firebase.initializeApp({
  apiKey: "AIzaSyAu_4_ANgwFOnTFyodDuDpUb6xQO_XEM9w",
  authDomain: "sote-push.firebaseapp.com",
  projectId: "sote-push",
  messagingSenderId: "363644394694",
  appId: "1:363644394694:web:22678a90fb1ca9653a8bc7"
});

// 백그라운드 알림 처리
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📩 백그라운드 메시지 수신:", payload);

  const notificationTitle = payload.notification.title || "새 알림";
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
