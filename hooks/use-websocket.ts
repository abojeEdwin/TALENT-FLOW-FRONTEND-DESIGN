'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { wsClient } from '@/lib/websocket-client';
import { WebSocketMessage } from '@/lib/types';

export function useWebSocket() {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const setupConnection = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        await wsClient.connect(token);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setIsConnected(false);
      }
    };

    setupConnection();

    return () => {
      // Don't disconnect on unmount - keep the connection alive
      // wsClient.disconnect();
    };
  }, [isAuthenticated, user]);

  const subscribe = useCallback(
    (handler: (message: WebSocketMessage) => void) => {
      return wsClient.subscribe(handler);
    },
    []
  );

  const send = useCallback((message: WebSocketMessage) => {
    return wsClient.send(message);
  }, []);

  return {
    isConnected,
    subscribe,
    send,
  };
}

export function useWebSocketMessage(
  messageType: string,
  onMessage: (message: WebSocketMessage) => void
) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      if (message.type === messageType) {
        onMessage(message);
      }
    });

    return unsubscribe;
  }, [messageType, subscribe, onMessage]);
}
