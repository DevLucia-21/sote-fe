// src/firebase-config.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAu_4_ANgwFOnTFyodDuDpUb6xQO_XEM9w",
  authDomain: "sote-push.firebaseapp.com",
  projectId: "sote-push",
  storageBucket: "sote-push.firebasestorage.app",
  messagingSenderId: "363644394694",
  appId: "1:363644394694:web:22678a90fb1ca9653a8bc7"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// FCM Messaging 객체
export const messaging = getMessaging(app);

// 브라우저에서 FCM Token 요청 함수
export async function requestFcmToken() {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BCr26OUQQCZxmMi-im_p09erDSyDJbYqIKWrNG7A34WDBaXIYY2y_adexqhWPIabA2OBxE-rHH6q5i6QGv4sD3I"
    });
    return token;
  } catch (error) {
    console.error("🔥 FCM Token 요청 실패:", error);
    return null;
  }
}

// 포그라운드 메시지(앱 켜져 있을 때)
export function onForegroundMessage(callback: (payload: any) => void) {
  onMessage(messaging, callback);
}