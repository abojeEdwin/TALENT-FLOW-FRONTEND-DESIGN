import { WebSocketMessage } from './types';

type MessageHandler = (message: WebSocketMessage) => void;

export class WebSocketClient {
  private static instance: WebSocketClient;
  private ws: WebSocket | null = null;
  private url: string;
  private accessToken: string | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isIntentionallyClosed = false;

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
    return new Promise((resolve, reject) => {
      try {
        this.accessToken = accessToken;
        this.isIntentionallyClosed = false;

        const url = new URL(this.url);
        url.searchParams.append('token', accessToken);

        this.ws = new WebSocket(url.toString());

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.messageHandlers.forEach((handler) => {
              try {
                handler(message);
              } catch (error) {
                console.error('[WebSocket] Handler error:', error);
              }
            });
          } catch (error) {
            console.error('[WebSocket] Message parse error:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          if (!this.isIntentionallyClosed) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.accessToken) {
      this.reconnectAttempts++;
      console.log(
        `[WebSocket] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );

      setTimeout(() => {
        if (this.accessToken) {
          this.connect(this.accessToken).catch((error) => {
            console.error('[WebSocket] Reconnect failed:', error);
          });
        }
      }, this.reconnectDelay);
    } else {
      console.log('[WebSocket] Max reconnect attempts reached');
    }
  }

  subscribe(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  send(message: WebSocketMessage): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('[WebSocket] Send error:', error);
        return false;
      }
    }
    return false;
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const wsClient = WebSocketClient.getInstance();
