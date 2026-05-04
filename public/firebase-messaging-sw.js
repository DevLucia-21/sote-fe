/* eslint-disable */
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAu_4_ANgwFOnTFyodDuDpUb6xQO_XEM9w",
  authDomain: "sote-push.firebaseapp.com",
  projectId: "sote-push",
  messagingSenderId: "363644394694",
  appId: "1:363644394694:web:22678a90fb1ca9653a8bc7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.notification?.title ||
    payload.data?.title ||
    "알림";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body,
    icon: payload.notification?.icon || payload.data?.icon || "/icon.png"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
