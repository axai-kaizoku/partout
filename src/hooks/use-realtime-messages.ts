"use client";

import { useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import type { Message } from "@/server/db/schema";

interface UseRealtimeMessagesProps {
  conversationId: string;
  onNewMessage: (message: Message) => void;
  enabled?: boolean;
}

export function useRealtimeMessages({
  conversationId,
  onNewMessage,
  enabled = true,
}: UseRealtimeMessagesProps) {
  useEffect(() => {
    if (!enabled || !conversationId) return;

    const supabase = supabaseBrowserClient();
    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "partout_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            // The payload.new contains the new message
            if (payload.new) {
              // Convert createdAt string to Date object
              const message = {
                ...payload.new,
                createdAt: new Date(payload.new.created_at || payload.new.createdAt),
              } as Message;
              onNewMessage(message);
            }
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId, onNewMessage, enabled]);
}
