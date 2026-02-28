/**
 * WebSocket client
 * Manages real-time connections for live updates
 */
type WebSocketEvent = 'connect' | 'disconnect' | 'error' | 'message';
type WebSocketEventHandler = (data?: unknown) => void;
declare class WebSocketClient {
    private ws;
    private url;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    private subscriptions;
    private eventHandlers;
    constructor(url: string);
    /**
     * Connect to WebSocket server
     */
    connect(): Promise<void>;
    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void;
    /**
     * Subscribe to a channel
     */
    subscribe(channel: string, handler: WebSocketEventHandler): () => void;
    /**
     * Send message to server
     */
    send(channel: string, data: unknown): void;
    /**
     * Listen to WebSocket events
     */
    on(event: WebSocketEvent, handler: WebSocketEventHandler): () => void;
    /**
     * Emit event to handlers
     */
    private emit;
    /**
     * Attempt to reconnect
     */
    private attemptReconnect;
    /**
     * Get connection status
     */
    isConnected(): boolean;
}
/**
 * Create WebSocket client instance
 */
declare function createWebSocketClient(url: string): WebSocketClient;

export { WebSocketClient, type WebSocketEvent, type WebSocketEventHandler, createWebSocketClient };
