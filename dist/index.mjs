import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRef, useEffect, useCallback, useState } from 'react';
import { z } from 'zod';

// src/utils/cn.ts
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/utils/format.ts
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * Math.pow(10, dm)) / Math.pow(10, dm) + " " + sizes[i];
}
function formatDuration(ms) {
  if (ms < 1e3) return `${Math.round(ms)}ms`;
  const seconds = Math.floor(ms / 1e3);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
function formatDate(date, format = "short") {
  const d = typeof date === "string" ? new Date(date) : date;
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: format === "short" ? "2-digit" : "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  return formatter.format(d);
}
function formatRelativeTime(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1e3);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return formatDate(date, "short");
}

// src/utils/validation.ts
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain an uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain a lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain a number");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain a special character (!@#$%^&*)");
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, "").replace(/["']/g, "");
}
function isRequired(value) {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== void 0;
}
function formatValidationError(error) {
  const formatted = {};
  error.errors.forEach((issue) => {
    const path = issue.path.join(".");
    formatted[path] = issue.message;
  });
  return formatted;
}

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
function useClickOutside(callback) {
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [callback]);
  return ref;
}
function useDebounce(callback, delay) {
  const timeoutRef = useRef();
  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("useLocalStorage error:", error);
      return initialValue;
    }
  });
  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue(value);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error("useLocalStorage error:", error);
      }
    },
    [key]
  );
  return [storedValue, setValue];
}
function useInView(ref, threshold = 0.1) {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [ref, threshold]);
  return isInView;
}
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    const handleChange = (e) => {
      setMatches(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);
  return matches;
}
function useForm({
  initialValues,
  schema,
  onSubmit
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = useCallback(
    (e) => {
      const { name, value, type } = e.target;
      if (type === "checkbox") {
        const checked = e.target.checked;
        setValues((prev) => ({
          ...prev,
          [name]: checked
        }));
      } else if (type === "number") {
        setValues((prev) => ({
          ...prev,
          [name]: parseFloat(value)
        }));
      } else {
        setValues((prev) => ({
          ...prev,
          [name]: value
        }));
      }
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );
  const setFieldValue = useCallback((field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);
  const setFieldError = useCallback((field, error) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error
    }));
  }, []);
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setErrors({});
      try {
        if (schema) {
          const result = schema.safeParse(values);
          if (!result.success) {
            const formatted = formatValidationError(result.error);
            setErrors(formatted);
            setIsSubmitting(false);
            return;
          }
        }
        await onSubmit(values);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formatted = formatValidationError(error);
          setErrors(formatted);
        } else {
          setErrors({ submit: error.message || "Submission failed" });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, schema, onSubmit]
  );
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);
  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
    setFieldError
  };
}
var MessageType = /* @__PURE__ */ ((MessageType2) => {
  MessageType2["NOTIFICATION"] = "notification";
  MessageType2["NAVIGATION_UPDATE"] = "navigation_update";
  MessageType2["SIDEBAR_UPDATE"] = "sidebar_update";
  MessageType2["BREADCRUMB_UPDATE"] = "breadcrumb_update";
  MessageType2["CONNECT"] = "connect";
  MessageType2["DISCONNECT"] = "disconnect";
  MessageType2["ERROR"] = "error";
  MessageType2["PONG"] = "pong";
  return MessageType2;
})(MessageType || {});
function useWebSocket(url, options = {}, onMessage) {
  const {
    enabled = true,
    reconnection = {
      maxRetries: 5,
      initialDelay: 1e3,
      maxDelay: 3e4,
      backoffMultiplier: 2
    }
  } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const mountedRef = useRef(true);
  const getReconnectionDelay = useCallback(() => {
    const {
      initialDelay = 1e3,
      maxDelay = 3e4,
      backoffMultiplier = 2
    } = reconnection;
    const delay = initialDelay * Math.pow(backoffMultiplier, reconnectCountRef.current);
    return Math.min(delay, maxDelay);
  }, [reconnection]);
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "ping",
          timestamp: Date.now()
        })
      );
    }
  }, []);
  const send = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const wsMessage = {
        type: message.type || "notification" /* NOTIFICATION */,
        payload: message.payload || message,
        timestamp: Date.now(),
        id: message.id || `msg-${Date.now()}`
      };
      wsRef.current.send(JSON.stringify(wsMessage));
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);
  const handleMessage = useCallback(
    (event) => {
      try {
        const message = JSON.parse(event.data);
        if (!message.timestamp) {
          message.timestamp = Date.now();
        }
        setLastMessage(message);
        onMessage?.(message);
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    },
    [onMessage]
  );
  const handleError = useCallback((event) => {
    const error2 = new Error("WebSocket error");
    if (mountedRef.current) {
      setError(error2);
    }
    console.error("WebSocket error:", event);
  }, []);
  const handleClose = useCallback(() => {
    if (mountedRef.current) {
      setIsConnected(false);
      if (reconnectCountRef.current < (reconnection.maxRetries ?? 5) && enabled) {
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
  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    try {
      wsRef.current = new WebSocket(url);
      wsRef.current.addEventListener("open", () => {
        if (mountedRef.current) {
          setIsConnected(true);
          setIsReconnecting(false);
          setError(null);
          reconnectCountRef.current = 0;
          heartbeatIntervalRef.current = setInterval(sendHeartbeat, 3e4);
        }
      });
      wsRef.current.addEventListener("message", handleMessage);
      wsRef.current.addEventListener("error", handleError);
      wsRef.current.addEventListener("close", handleClose);
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        setError(error2);
      }
    }
  }, [url, enabled, handleMessage, handleError, handleClose, sendHeartbeat]);
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
  const reconnect = useCallback(() => {
    reconnectCountRef.current = 0;
    disconnect();
    if (enabled) {
      setTimeout(() => {
        connect();
      }, 100);
    }
  }, [enabled, disconnect, connect]);
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
    reconnect
  };
}
function useWebSocketListener(messageType, callback) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  return useCallback((message) => {
    if (message.type === messageType) {
      callbackRef.current(message.payload);
    }
  }, [messageType]);
}

export { MessageType, WebSocketClient, cn, createWebSocketClient, formatBytes, formatDate, formatDuration, formatRelativeTime, formatValidationError, isRequired, isValidEmail, isValidUrl, sanitizeInput, useClickOutside, useDebounce, useForm, useInView, useLocalStorage, useMediaQuery, useWebSocket, useWebSocketListener, validatePassword };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map