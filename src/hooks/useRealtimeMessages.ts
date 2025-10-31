import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  residence_id: string;
  created_at: string;
  file_url?: string;
  file_type?: string;
  file_name?: string;
  file_size?: number;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const useRealtimeMessages = (residenceId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!residenceId) return;

    let channel: RealtimeChannel;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          profiles:sender_id (
            full_name,
            avatar_url
          )
        `)
        .eq("residence_id", residenceId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to real-time updates
    channel = supabase
      .channel(`messages-${residenceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `residence_id=eq.${residenceId}`,
        },
        async (payload) => {
          // Fetch sender profile data
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", payload.new.sender_id)
            .single();

          const newMessage = {
            ...payload.new,
            profiles: profile,
          } as Message;

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [residenceId]);

  return { messages, loading };
};