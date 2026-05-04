/* eslint-disable */
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

/**
 * 포트폴리오 공개 리포용 예시 설정입니다.
 * 실제 배포 환경에서는 Firebase 콘솔의 웹 앱 설정값으로 교체해야 합니다.
 *
 * 주의:
 * - public 폴더의 service worker 파일은 Vite의 import.meta.env를 직접 사용할 수 없습니다.
 * - 따라서 공개 리포에는 실제 Firebase 프로젝트 값을 커밋하지 않습니다.
 */
firebase.initializeApp({
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.notification?.title ||
    payload.data?.title ||
    "알림";

  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body,
    icon: payload.notification?.icon || payload.data?.icon || "/icon.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});