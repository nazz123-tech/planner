/**
 * Desktop notifications, shown by the app itself.
 *
 * On macOS these arrive as ordinary system banners and land in Notification
 * Centre, the same as any native app. Nothing here touches the server: the
 * browser is the only thing that has to be running.
 */

export type NotificationSupport =
    | "granted"
    | "denied"
    | "default"
    | "unsupported";

export function notificationSupport(): NotificationSupport {
    if (typeof window === "undefined" || !("Notification" in window)) {
        return "unsupported";
    }
    return Notification.permission;
}

/**
 * Must be called from a user gesture — Safari ignores a permission prompt
 * that isn't tied to a click.
 */
export async function requestNotificationPermission(): Promise<NotificationSupport> {
    if (typeof window === "undefined" || !("Notification" in window)) {
        return "unsupported";
    }
    if (Notification.permission !== "default") {
        return Notification.permission;
    }
    try {
        return await Notification.requestPermission();
    } catch {
        // Older Safari only has the callback form and can throw on the
        // promise one; treat a failure as "still undecided".
        return Notification.permission;
    }
}

interface ShowArgs {
    title: string;
    body: string;
    /** Collapses repeats of the same task into one banner. */
    tag: string;
    onClick?: () => void;
}

export function showNotification({ title, body, tag, onClick }: ShowArgs) {
    if (notificationSupport() !== "granted") return;

    try {
        const notification = new Notification(title, {
            body,
            tag,
            icon: "/favicon.ico",
            // The banner is the reminder; re-alerting a replaced tag would
            // make a rescheduled task buzz twice.
            renotify: false,
        } as NotificationOptions);

        notification.onclick = () => {
            window.focus();
            notification.close();
            onClick?.();
        };
    } catch {
        // Some browsers throw when constructing notifications outside a
        // service worker. A failed reminder must never break the page.
    }
}
