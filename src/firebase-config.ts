// src/firebase-config.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// FCM Messaging 객체
export const messaging = getMessaging(app);

// 브라우저에서 FCM Token 요청 함수
export async function requestFcmToken() {
  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
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