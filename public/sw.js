// Service Worker — 웹 푸시 수신 및 알림 표시

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "새 알림", body: event.data.text(), data: {} };
  }

  const { title, body, data = {} } = payload;

  const options = {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    data,
    vibrate: [100, 50, 100],
    tag: data.type ?? "default",       // 같은 tag면 이전 알림 대체
    renotify: true,
    actions: [
      { action: "open", title: "앱 열기" },
      { action: "dismiss", title: "닫기" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림 클릭 — 앱 포커스 또는 새 탭 오픈
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const urlToOpen = self.location.origin;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const existing = clientList.find(
          (c) => c.url.startsWith(urlToOpen) && "focus" in c,
        );
        if (existing) return existing.focus();
        return clients.openWindow(urlToOpen);
      }),
  );
});
