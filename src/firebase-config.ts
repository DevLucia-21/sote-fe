import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
let messagingPromise: Promise<Messaging | null> | null = null;

async function getMessagingInstance() {
  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => (supported ? getMessaging(app) : null))
      .catch(() => null);
  }

  return messagingPromise;
}

export async function requestFcmToken() {
  try {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return null;
    }

    const messaging = await getMessagingInstance();
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    if (!messaging || !vapidKey) {
      return null;
    }

    const serviceWorkerRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    return getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("FCM 토큰 요청 실패", error);
    }

    return null;
  }
}

export async function onForegroundMessage(callback: (payload: any) => void) {
  const messaging = await getMessagingInstance();

  if (!messaging) {
    return () => undefined;
  }

  return onMessage(messaging, callback);
}
