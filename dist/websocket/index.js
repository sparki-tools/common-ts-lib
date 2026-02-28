'use strict';

// src/websocket/client.ts
var WebSocketClient = class {
  constructor(url) {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3e3;
    this.subscriptions = /* @__PURE__ */ new Set();
    this.eventHandlers = /* @__PURE__ */ new Map();
    this.url = url;
  }
  /**
   * Connect to WebSocket server
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.emit("connect");
          resolve();
        };
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit("message", data);
            const channelHandlers = this.subscriptions;
            channelHandlers.forEach((sub) => {
              if (sub.channel === data.channel) {
                sub.handler(data.payload);
              }
            });
          } catch (error) {
            console.error("WebSocket message parse error:", error);
          }
        };
        this.ws.onerror = (error) => {
          this.emit("error", error);
          reject(error);
        };
        this.ws.onclose = () => {
          this.emit("disconnect");
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
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }
  /**
   * Subscribe to a channel
   */
  subscribe(channel, handler) {
    const subscription = { channel, handler };
    this.subscriptions.add(subscription);
    return () => {
      this.subscriptions.delete(subscription);
    };
  }
  /**
   * Send message to server
   */
  send(channel, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          channel,
          payload: data
        })
      );
    }
  }
  /**
   * Listen to WebSocket events
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, /* @__PURE__ */ new Set());
    }
    this.eventHandlers.get(event).add(handler);
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }
  /**
   * Emit event to handlers
   */
  emit(event, data) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }
  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`WebSocket reconnecting... (attempt ${this.reconnectAttempts})`);
        this.connect().catch((error) => {
          console.error("WebSocket reconnection failed:", error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }
  /**
   * Get connection status
   */
  isConnected() {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
};
function createWebSocketClient(url) {
  return new WebSocketClient(url);
}

exports.WebSocketClient = WebSocketClient;
exports.createWebSocketClient = createWebSocketClient;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map