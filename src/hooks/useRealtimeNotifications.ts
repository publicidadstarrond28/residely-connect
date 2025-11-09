import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";

// Solicitar permiso para notificaciones push
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("Este navegador no soporta notificaciones");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

// Mostrar notificación push del navegador
const showBrowserNotification = (title: string, message: string, type: string) => {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body: message,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: `payment-${type}`,
      requireInteraction: type === "payment_overdue" || type === "payment_rejected",
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const useRealtimeNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Solicitar permiso para notificaciones push al cargar
    requestNotificationPermission();

    // Cargar notificaciones iniciales
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };

    fetchNotifications();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Mostrar toast según el tipo de notificación
          if (newNotification.type === "payment_confirmed") {
            toast({
              title: "✅ " + newNotification.title,
              description: newNotification.message,
              duration: 5000,
            });
            showBrowserNotification("✅ " + newNotification.title, newNotification.message, newNotification.type);
          } else if (newNotification.type === "payment_rejected") {
            toast({
              title: "❌ " + newNotification.title,
              description: newNotification.message,
              variant: "destructive",
              duration: 5000,
            });
            showBrowserNotification("❌ " + newNotification.title, newNotification.message, newNotification.type);
          } else if (newNotification.type === "payment_reminder" || newNotification.type === "payment_overdue") {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: 4000,
            });
            showBrowserNotification(newNotification.title, newNotification.message, newNotification.type);
          } else {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: 4000,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );

          if (updatedNotification.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
    } else {
      setUnreadCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};