import { Client, IMessage, StompConfig } from '@stomp/stompjs';
import { WebSocketMessage } from './types';

type MessageHandler = (message: WebSocketMessage) => void;

export class WebSocketClient {
  private static instance: WebSocketClient;
  private client: Client | null = null;
  private url: string;
  private accessToken: string | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isIntentionallyClosed = false;
  private subscriptions: Map<string, (() => void) | null> = new Map();

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

  connect(accessToken: string): Promise<void> {
    console.log('[STOMP] connect() called with URL:', this.url);
    return new Promise((resolve, reject) => {
      try {
        this.accessToken = accessToken;
        this.isIntentionallyClosed = false;

        this.client = new Client({
          webSocketFactory: () => {
            const wsUrl = new URL(this.url);
            wsUrl.searchParams.append('token', accessToken);
            console.log('[STOMP] Creating WebSocket to:', wsUrl.toString());
            return new WebSocket(wsUrl.toString());
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 15000,
          heartbeatOutgoing: 15000,
          onConnect: (frame) => {
            console.log('[STOMP] Connected');
            this.reconnectAttempts = 0;
            this.resubscribeTopics();
            resolve();
          },
          onDisconnect: (frame) => {
            console.log('[STOMP] Disconnected');
            if (!this.isIntentionallyClosed) {
              this.attemptReconnect();
            }
          },
          onStompError: (frame) => {
            console.error('[STOMP] Error:', frame.headers['message']);
          },
          onWebSocketError: (error) => {
            console.error('[STOMP] WebSocket Error:', error);
          },
        });

        this.client.activate();
        console.log('[STOMP] Client activated');
      } catch (error) {
        console.error('[STOMP] Connect error:', error);
        reject(error);
      }
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

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.accessToken) {
      this.reconnectAttempts++;
      console.log(
        `[STOMP] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );
      setTimeout(() => {
        if (this.accessToken) {
          this.connect(this.accessToken).catch((error) => {
            console.error('[STOMP] Reconnect failed:', error);
          });
        }
      }, this.reconnectDelay);
    } else {
      console.log('[STOMP] Max reconnect attempts reached');
    }
  }

  private handleMessage(event: IMessage) {
    try {
      const body = JSON.parse(event.body);
      const message: WebSocketMessage = body;
      this.messageHandlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error('[STOMP] Handler error:', error);
        }
      });
    } catch (error) {
      console.error('[STOMP] Message parse error:', error);
    }
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
      console.log('[STOMP] Queued subscription:', topic);
      return () => {
        this.subscriptions.delete(topic);
      };
    }

    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const body = JSON.parse(message.body);
        handler(body as T);
      } catch (error) {
        console.error('[STOMP] Parse error:', error);
      }
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
      } catch (error) {
        console.error('[STOMP] Send error:', error);
        return false;
      }
    }
    return false;
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    this.subscriptions.clear();
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