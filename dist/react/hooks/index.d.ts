import * as react from 'react';
import { ZodSchema } from 'zod';

/**
 * UI Hooks
 * Reusable UI interaction hooks
 */
/**
 * Hook to detect clicks outside an element
 */
declare function useClickOutside(callback: () => void): react.RefObject<HTMLDivElement>;
/**
 * Hook for debounced function
 */
declare function useDebounce<T extends (...args: unknown[]) => unknown>(callback: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Hook for local storage
 */
declare function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void];
/**
 * Hook to detect if element is in viewport
 */
declare function useInView(ref: React.RefObject<HTMLElement>, threshold?: number): boolean;
/**
 * Hook for media query
 */
declare function useMediaQuery(query: string): boolean;

/**
 * useForm Hook
 * Custom hook for managing form state with validation
 */

interface UseFormOptions<T> {
    initialValues: T;
    schema?: ZodSchema;
    onSubmit: (data: T) => Promise<void> | void;
}
interface UseFormReturn<T> {
    values: T;
    errors: Record<string, string>;
    isSubmitting: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    setFieldValue: (field: string, value: any) => void;
    resetForm: () => void;
    setFieldError: (field: string, error: string) => void;
}
declare function useForm<T extends Record<string, any>>({ initialValues, schema, onSubmit, }: UseFormOptions<T>): UseFormReturn<T>;

/**
 * WebSocket message types
 */
declare enum MessageType {
    NOTIFICATION = "notification",
    NAVIGATION_UPDATE = "navigation_update",
    SIDEBAR_UPDATE = "sidebar_update",
    BREADCRUMB_UPDATE = "breadcrumb_update",
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    ERROR = "error",
    PONG = "pong"
}
/**
 * WebSocket message structure
 */
interface WebSocketMessage {
    type: MessageType;
    payload: any;
    timestamp: number;
    id?: string;
}
/**
 * WebSocket hook state
 */
interface UseWebSocketState {
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
declare function useWebSocket(url: string, options?: {
    enabled?: boolean;
    reconnection?: ReconnectionConfig;
}, onMessage?: (message: WebSocketMessage) => void): UseWebSocketState;
/**
 * Hook for handling specific message types
 */
declare function useWebSocketListener(messageType: MessageType, callback: (payload: any) => void): (message: WebSocketMessage) => void;

export { MessageType, type UseWebSocketState, type WebSocketMessage, useClickOutside, useDebounce, useForm, useInView, useLocalStorage, useMediaQuery, useWebSocket, useWebSocketListener };
