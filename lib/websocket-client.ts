import { Client, IMessage } from '@stomp/stompjs';
import { WebSocketMessage } from './types';

type MessageHandler = (message: WebSocketMessage) => void;

export class WebSocketClient {
  private static instance: WebSocketClient;
  private client: Client | null = null;
  private url: string;
  private accessToken: string | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 2;
  private reconnectDelay = 10000;
  private isIntentionallyClosed = false;
  private subscriptions: Map<string, (() => void) | null> = new Map();
  private isConnecting = false;

  private constructor(url: string) {
    this.url = url;
  }

  static getInstance(url?: string): WebSocketClient {
    if (!WebSocketClient.instance) {
      const wsUrl = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';
      WebSocketClient.instance = new WebSocketClient(wsUrl);
    }
    return WebSocketClient.instance;
  }

  static resetInstance(): void {
    if (WebSocketClient.instance) {
      WebSocketClient.instance.disconnect();
      WebSocketClient.instance = null as any;
    }
  }

  connect(accessToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        resolve();
        return;
      }

      if (this.client?.connected) {
        resolve();
        return;
      }

      this.isConnecting = true;
      this.accessToken = accessToken;
      this.isIntentionallyClosed = false;

      this.client = new Client({
        webSocketFactory: () => {
          const wsUrl = new URL(this.url);
          wsUrl.searchParams.append('token', accessToken);
          return new WebSocket(wsUrl.toString());
        },
        reconnectDelay: 0,
        heartbeatIncoming: 30000,
        heartbeatOutgoing: 30000,
        onConnect: () => {
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.resubscribeTopics();
          resolve();
        },
        onDisconnect: () => {
          this.isConnecting = false;
          if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
              if (this.accessToken && !this.isIntentionallyClosed) {
                this.client?.activate();
              }
            }, this.reconnectDelay);
          }
        },
        onStompError: (frame) => {
          this.isConnecting = false;
        },
        onWebSocketError: () => {
          this.isConnecting = false;
        },
      });

      this.client.activate();
    });
  }

  private resubscribeTopics() {
    if (!this.client || !this.client.connected) return;
    this.subscriptions.forEach((unsubscribe, topic) => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch {}
        this.client?.subscribe(topic, (message: IMessage) => {
          this.handleMessage(message);
        });
      }
    });
  }

  private handleMessage(event: IMessage) {
    try {
      const body = JSON.parse(event.body);
      const message: WebSocketMessage = body;
      this.messageHandlers.forEach((handler) => {
        try {
          handler(message);
        } catch {}
      });
    } catch {}
  }

  subscribe(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);

    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  subscribeToTopic<T>(topic: string, handler: (message: T) => void): () => void {
    if (!this.client || !this.client.connected) {
      this.subscriptions.set(topic, null);
      return () => {
        this.subscriptions.delete(topic);
      };
    }

    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const body = JSON.parse(message.body);
        handler(body as T);
      } catch {}
    });

    this.subscriptions.set(topic, () => subscription.unsubscribe());

    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    };
  }

  send(message: WebSocketMessage): boolean {
    if (this.client && this.client.connected) {
      try {
        this.client.publish({
          destination: '/app' + (message.type || ''),
          body: JSON.stringify(message.payload),
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    this.subscriptions.clear();
    this.isConnecting = false;
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

export const wsClient = WebSocketClient.getInstance();