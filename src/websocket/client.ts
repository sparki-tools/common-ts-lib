/**
 * WebSocket client
 * Manages real-time connections for live updates
 */

export type WebSocketEvent = 'connect' | 'disconnect' | 'error' | 'message';

export type WebSocketEventHandler = (data?: unknown) => void;

interface WebSocketSubscription {
  channel: string;
  handler: WebSocketEventHandler;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private subscriptions: Set<WebSocketSubscription> = new Set();
  private eventHandlers: Map<WebSocketEvent, Set<WebSocketEventHandler>> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.emit('connect');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit('message', data);

            // Route to specific channel subscriptions
            const channelHandlers = this.subscriptions;
            channelHandlers.forEach((sub) => {
              if (sub.channel === data.channel) {
                sub.handler(data.payload);
              }
            });
          } catch (error) {
            console.error('WebSocket message parse error:', error);
          }
        };

        this.ws.onerror = (error) => {
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.emit('disconnect');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channel: string, handler: WebSocketEventHandler): () => void {
    const subscription: WebSocketSubscription = { channel, handler };
    this.subscriptions.add(subscription);

    // Return unsubscribe function
    return () => {
      this.subscriptions.delete(subscription);
    };
  }

  /**
   * Send message to server
   */
  send(channel: string, data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          channel,
          payload: data,
        }),
      );
    }
  }

  /**
   * Listen to WebSocket events
   */
  on(event: WebSocketEvent, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /**
   * Emit event to handlers
   */
  private emit(event: WebSocketEvent, data?: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`WebSocket reconnecting... (attempt ${this.reconnectAttempts})`);
        this.connect().catch((error) => {
          console.error('WebSocket reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

/**
 * Create WebSocket client instance
 */
export function createWebSocketClient(url: string): WebSocketClient {
  return new WebSocketClient(url);
}
