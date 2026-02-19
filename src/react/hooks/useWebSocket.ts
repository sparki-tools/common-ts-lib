import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * WebSocket message types
 */
export enum MessageType {
  NOTIFICATION = 'notification',
  NAVIGATION_UPDATE = 'navigation_update',
  SIDEBAR_UPDATE = 'sidebar_update',
  BREADCRUMB_UPDATE = 'breadcrumb_update',
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  PONG = 'pong',
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  timestamp: number;
  id?: string;
}

/**
 * WebSocket hook state
 */
export interface UseWebSocketState {
  isConnected: boolean;
  isReconnecting: boolean;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
  send: (message: any) => void;
  disconnect: () => void;
  reconnect: () => void;
}

/**
 * WebSocket reconnection strategy
 */
interface ReconnectionConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

/**
 * Hook for WebSocket connection management
 *
 * Features:
 * - Automatic connection on mount
 * - Reconnection with exponential backoff
 * - Message type routing
 * - Heartbeat/ping support
 * - Error recovery
 * - Connection state management
 *
 * @param url - WebSocket server URL
 * @param options - Connection options
 * @param onMessage - Message handler
 */
export function useWebSocket(
  url: string,
  options: {
    enabled?: boolean;
    reconnection?: ReconnectionConfig;
  } = {},
  onMessage?: (message: WebSocketMessage) => void
): UseWebSocketState {
  const {
    enabled = true,
    reconnection = {
      maxRetries: 5,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
    },
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  /**
   * Calculate reconnection delay with exponential backoff
   */
  const getReconnectionDelay = useCallback(() => {
    const {
      initialDelay = 1000,
      maxDelay = 30000,
      backoffMultiplier = 2,
    } = reconnection;

    const delay = initialDelay * Math.pow(backoffMultiplier, reconnectCountRef.current);
    return Math.min(delay, maxDelay);
  }, [reconnection]);

  /**
   * Send heartbeat (ping) to server
   */
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'ping',
          timestamp: Date.now(),
        })
      );
    }
  }, []);

  /**
   * Send message through WebSocket
   */
  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const wsMessage: WebSocketMessage = {
        type: message.type || MessageType.NOTIFICATION,
        payload: message.payload || message,
        timestamp: Date.now(),
        id: message.id || `msg-${Date.now()}`,
      };
      wsRef.current.send(JSON.stringify(wsMessage));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  /**
   * Handle incoming messages
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;

        if (!message.timestamp) {
          message.timestamp = Date.now();
        }

        setLastMessage(message);
        onMessage?.(message);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    },
    [onMessage]
  );

  /**
   * Handle connection error
   */
  const handleError = useCallback((event: Event) => {
    const error = new Error('WebSocket error');
    if (mountedRef.current) {
      setError(error);
    }
    console.error('WebSocket error:', event);
  }, []);

  /**
   * Handle connection close
   */
  const handleClose = useCallback(() => {
    if (mountedRef.current) {
      setIsConnected(false);

      // Attempt reconnection
      if (
        reconnectCountRef.current < (reconnection.maxRetries ?? 5) &&
        enabled
      ) {
        setIsReconnecting(true);
        const delay = getReconnectionDelay();
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            reconnectCountRef.current += 1;
            connect();
          }
        }, delay);
      }
    }
  }, [enabled, reconnection.maxRetries, getReconnectionDelay]);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.addEventListener('open', () => {
        if (mountedRef.current) {
          setIsConnected(true);
          setIsReconnecting(false);
          setError(null);
          reconnectCountRef.current = 0;

          // Start heartbeat
          heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000);
        }
      });

      wsRef.current.addEventListener('message', handleMessage);
      wsRef.current.addEventListener('error', handleError);
      wsRef.current.addEventListener('close', handleClose);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        setError(error);
      }
    }
  }, [url, enabled, handleMessage, handleError, handleClose, sendHeartbeat]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (mountedRef.current) {
      setIsConnected(false);
      setIsReconnecting(false);
    }
  }, []);

  /**
   * Manual reconnect
   */
  const reconnect = useCallback(() => {
    reconnectCountRef.current = 0;
    disconnect();
    if (enabled) {
      setTimeout(() => {
        connect();
      }, 100);
    }
  }, [enabled, disconnect, connect]);

  /**
   * Connect on mount
   */
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    isReconnecting,
    lastMessage,
    error,
    send,
    disconnect,
    reconnect,
  };
}

/**
 * Hook for handling specific message types
 */
export function useWebSocketListener(
  messageType: MessageType,
  callback: (payload: any) => void
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((message: WebSocketMessage) => {
    if (message.type === messageType) {
      callbackRef.current(message.payload);
    }
  }, [messageType]);
}
