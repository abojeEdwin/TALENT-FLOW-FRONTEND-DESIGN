"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import {
  MessageResponse,
  ReadEvent,
  TypingEvent,
  ParticipantAddEvent,
  ParticipantRemoveEvent,
} from "@/lib/types/chat";
import { getAuthToken } from "@/lib/api/auth";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";

type MessageHandler<T> = (data: T) => void;

export interface ChatWebSocketOptions {
  onNewMessage?: MessageHandler<MessageResponse>;
  onReadEvent?: MessageHandler<ReadEvent>;
  onTypingEvent?: MessageHandler<TypingEvent>;
  onParticipantAdd?: MessageHandler<ParticipantAddEvent>;
  onParticipantRemove?: MessageHandler<ParticipantRemoveEvent>;
}

export function useChatWebSocket(conversationId: string | null, options: ChatWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const disconnect = useCallback(() => {
    subscriptionsRef.current.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch {}
    });
    subscriptionsRef.current.clear();

    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!conversationId || isConnecting || isConnected) return;

    const token = getAuthToken();
    if (!token) return;

    setIsConnecting(true);

    const client = new Client({
      webSocketFactory: () => {
        const wsUrl = new URL(WS_URL);
        wsUrl.searchParams.append("token", token);
        return new WebSocket(wsUrl.toString());
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 30000,
      heartbeatOutgoing: 30000,
      onConnect: () => {
        setIsConnected(true);
        setIsConnecting(false);
        subscribeToTopics(client, conversationId);
      },
      onDisconnect: () => {
        setIsConnected(false);
        setIsConnecting(false);
      },
      onStompError: () => {
        setIsConnected(false);
        setIsConnecting(false);
      },
    });

    clientRef.current = client;
    client.activate();
  }, [conversationId, isConnecting, isConnected]);

  const subscribeToTopics = (client: Client, convId: string) => {
    const subMessages = client.subscribe(`/topic/chat/${convId}`, (msg: IMessage) => {
      try {
        const data = JSON.parse(msg.body);
        if (options.onNewMessage && data.id) {
          const message: MessageResponse = data;
          options.onNewMessage(message);
        }
      } catch {}
    });
    subscriptionsRef.current.set(`messages-${convId}`, () => subMessages.unsubscribe());

    const subRead = client.subscribe(`/topic/chat/${convId}/read`, (msg: IMessage) => {
      try {
        const data = JSON.parse(msg.body);
        if (options.onReadEvent && data.userId) {
          options.onReadEvent(data as ReadEvent);
        }
      } catch {}
    });
    subscriptionsRef.current.set(`read-${convId}`, () => subRead.unsubscribe());

    const subTyping = client.subscribe(`/topic/chat/${convId}/typing`, (msg: IMessage) => {
      try {
        const data = JSON.parse(msg.body);
        if (options.onTypingEvent && data.userId !== undefined) {
          options.onTypingEvent(data as TypingEvent);
        }
      } catch {}
    });
    subscriptionsRef.current.set(`typing-${convId}`, () => subTyping.unsubscribe());

    const subParticipants = client.subscribe(
      `/topic/chat/${convId}/participants`,
      (msg: IMessage) => {
        try {
          const data = JSON.parse(msg.body);
          if (options.onParticipantAdd && data.userIds) {
            options.onParticipantAdd(data as ParticipantAddEvent);
          } else if (options.onParticipantRemove && data.userId) {
            options.onParticipantRemove(data as ParticipantRemoveEvent);
          }
        } catch {}
      }
    );
    subscriptionsRef.current.set(
      `participants-${convId}`,
      () => subParticipants.unsubscribe()
    );
  };

  const sendTyping = useCallback(
    (convId: string, isTyping: boolean) => {
      if (clientRef.current?.connected) {
        clientRef.current.publish({
          destination: `/app/chat/${convId}/typing`,
          body: JSON.stringify({ isTyping }),
        });
      }
    },
    []
  );

  useEffect(() => {
    if (conversationId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [conversationId, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    sendTyping,
    connect,
    disconnect,
  };
}

export function createChatWebSocket() {
  const clientRef = useRef<Client | null>(null);
  const handlersRef = useRef<Map<string, Set<MessageHandler<unknown>>>>(new Map());

  const connect = (token: string) => {
    if (clientRef.current?.connected) return;

    const client = new Client({
      webSocketFactory: () => {
        const wsUrl = new URL(WS_URL);
        wsUrl.searchParams.append("token", token);
        return new WebSocket(wsUrl.toString());
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 30000,
      heartbeatOutgoing: 30000,
      onConnect: () => {
        resubscribe();
      },
      onDisconnect: () => {},
    });

    clientRef.current = client;
    client.activate();
  };

  const subscribe = <T,>(topic: string, handler: MessageHandler<T>) => {
    if (!handlersRef.current.has(topic)) {
      handlersRef.current.set(topic, new Set());
    }
    handlersRef.current.get(topic)!.add(handler as MessageHandler<unknown>);
  };

  const unsubscribe = <T,>(topic: string, handler: MessageHandler<T>) => {
    handlersRef.current.get(topic)?.delete(handler as MessageHandler<unknown>);
  };

  const resubscribe = () => {
    if (!clientRef.current?.connected) return;
    handlersRef.current.forEach((handlers, topic) => {
      const sub = clientRef.current!.subscribe(topic, (msg: IMessage) => {
        try {
          const data = JSON.parse(msg.body);
          handlers.forEach((h) => h(data));
        } catch {}
      });
    });
  };

  const disconnect = () => {
    handlersRef.current.clear();
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
  };

  const send = (destination: string, body: unknown) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  };

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    isConnected: () => clientRef.current?.connected ?? false,
  };
}