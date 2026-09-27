export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}

export async function fireNotification(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, { body, icon: '/icons/icon-192.png', tag: 'ledger-reminder' })
      return
    }
  } catch {
    // fall through to direct Notification
  }
  new Notification(title, { body, icon: '/icons/icon-192.png' })
}

function msUntil(timeHHMM: string): number {
  const [h, m] = timeHHMM.split(':').map(Number)
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0)
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1)
  return next.getTime() - now.getTime()
}

/**
 * Best-effort in-app reminder: schedules a timer for the next occurrence of
 * `timeHHMM` while this tab/PWA stays open. iOS suspends JS timers once the
 * app is backgrounded or closed, so this alone can't guarantee an 11pm ping —
 * pair it with an iPhone Shortcuts automation that opens the app at that time
 * for a reliable trigger (see Settings).
 */
export function scheduleReminder(timeHHMM: string, onFire: () => void): () => void {
  let timeout: ReturnType<typeof setTimeout>
  const tick = () => {
    timeout = setTimeout(() => {
      onFire()
      tick()
    }, msUntil(timeHHMM))
  }
  tick()
  return () => clearTimeout(timeout)
}
