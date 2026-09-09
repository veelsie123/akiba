"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

const iconForType: Record<string, string> = {
  APPOINTMENT_REMINDER: "📅",
  CASE_ASSIGNMENT: "⚖️",
  PAYMENT_RECEIVED: "💰",
  INVOICE_GENERATED: "📄",
};

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const response = await fetch("/api/notifications", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load notifications");

      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (loadError) {
      console.error("Error loading notifications:", loadError);
      const message = loadError instanceof Error ? loadError.message : "Unable to load notifications";
      setError(message);
      if (refresh) toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadNotifications(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleNotifications = useMemo(
    () => filter === "unread" ? notifications.filter((notification) => !notification.read) : notifications,
    [filter, notifications],
  );
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      setNotifications((current) => current.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ));
    } catch (markError) {
      console.error("Error marking notification as read:", markError);
      toast.error(markError instanceof Error ? markError.message : "Unable to update notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (!response.ok) throw new Error("Failed to mark notifications as read");
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
    } catch (markError) {
      console.error("Error marking notifications as read:", markError);
      toast.error(markError instanceof Error ? markError.message : "Unable to update notifications");
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Inbox</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Notifications</h1>
          <p className="mt-2 text-sm text-slate-500">Stay up to date with assignments, appointments, payments, and other workspace activity.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadNotifications(true)}
          disabled={isLoading || isRefreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><Bell className="h-6 w-6" /></div>
            <div>
              <h2 className="font-semibold text-slate-900">Your activity</h2>
              <p className="text-sm text-slate-500">{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setFilter("all")} className={`rounded-lg px-3 py-2 text-sm font-medium ${filter === "all" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>All</button>
            <button type="button" onClick={() => setFilter("unread")} className={`rounded-lg px-3 py-2 text-sm font-medium ${filter === "unread" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Unread</button>
            <button type="button" onClick={() => void markAllAsRead()} disabled={unreadCount === 0} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-40">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-slate-500">Loading notifications...</p>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button type="button" onClick={() => void loadNotifications(true)} className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800">Try again</button>
          </div>
        ) : visibleNotifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">{filter === "unread" ? "You are all caught up." : "No notifications yet."}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleNotifications.map((notification) => (
              <button key={notification.id} type="button" onClick={() => !notification.read && void markAsRead(notification.id)} className={`flex w-full items-start gap-4 px-2 py-5 text-left transition hover:bg-slate-50 ${!notification.read ? "bg-indigo-50/50" : ""}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">{iconForType[notification.type] || "🔔"}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{notification.title}</span>
                    {!notification.read ? <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">Unread</span> : null}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{notification.message}</span>
                  <span className="mt-2 block text-xs text-slate-400">{relativeTime(notification.createdAt)} · {notification.type.replaceAll("_", " ")}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
