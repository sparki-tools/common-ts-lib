'use strict';

var react = require('react');
var zod = require('zod');

// src/react/hooks/useUI.ts
function useClickOutside(callback) {
  const ref = react.useRef(null);
  react.useEffect(() => {
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
  const timeoutRef = react.useRef();
  return react.useCallback(
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
  const [storedValue, setStoredValue] = react.useState(() => {
    try {
      const item = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("useLocalStorage error:", error);
      return initialValue;
    }
  });
  const setValue = react.useCallback(
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
  const [isInView, setIsInView] = react.useState(false);
  react.useEffect(() => {
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
  const [matches, setMatches] = react.useState(false);
  react.useEffect(() => {
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

// src/utils/validation.ts
function formatValidationError(error) {
  const formatted = {};
  error.errors.forEach((issue) => {
    const path = issue.path.join(".");
    formatted[path] = issue.message;
  });
  return formatted;
}

// src/react/hooks/useForm.ts
function useForm({
  initialValues,
  schema,
  onSubmit
}) {
  const [values, setValues] = react.useState(initialValues);
  const [errors, setErrors] = react.useState({});
  const [isSubmitting, setIsSubmitting] = react.useState(false);
  const handleChange = react.useCallback(
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
  const setFieldValue = react.useCallback((field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);
  const setFieldError = react.useCallback((field, error) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error
    }));
  }, []);
  const handleSubmit = react.useCallback(
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
        if (error instanceof zod.z.ZodError) {
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
  const resetForm = react.useCallback(() => {
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
  const [isConnected, setIsConnected] = react.useState(false);
  const [isReconnecting, setIsReconnecting] = react.useState(false);
  const [lastMessage, setLastMessage] = react.useState(null);
  const [error, setError] = react.useState(null);
  const wsRef = react.useRef(null);
  const reconnectCountRef = react.useRef(0);
  const reconnectTimeoutRef = react.useRef(null);
  const heartbeatIntervalRef = react.useRef(null);
  const mountedRef = react.useRef(true);
  const getReconnectionDelay = react.useCallback(() => {
    const {
      initialDelay = 1e3,
      maxDelay = 3e4,
      backoffMultiplier = 2
    } = reconnection;
    const delay = initialDelay * Math.pow(backoffMultiplier, reconnectCountRef.current);
    return Math.min(delay, maxDelay);
  }, [reconnection]);
  const sendHeartbeat = react.useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "ping",
          timestamp: Date.now()
        })
      );
    }
  }, []);
  const send = react.useCallback((message) => {
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
  const handleMessage = react.useCallback(
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
  const handleError = react.useCallback((event) => {
    const error2 = new Error("WebSocket error");
    if (mountedRef.current) {
      setError(error2);
    }
    console.error("WebSocket error:", event);
  }, []);
  const handleClose = react.useCallback(() => {
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
  const connect = react.useCallback(() => {
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
  const disconnect = react.useCallback(() => {
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
  const reconnect = react.useCallback(() => {
    reconnectCountRef.current = 0;
    disconnect();
    if (enabled) {
      setTimeout(() => {
        connect();
      }, 100);
    }
  }, [enabled, disconnect, connect]);
  react.useEffect(() => {
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
  const callbackRef = react.useRef(callback);
  react.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  return react.useCallback((message) => {
    if (message.type === messageType) {
      callbackRef.current(message.payload);
    }
  }, [messageType]);
}

exports.MessageType = MessageType;
exports.useClickOutside = useClickOutside;
exports.useDebounce = useDebounce;
exports.useForm = useForm;
exports.useInView = useInView;
exports.useLocalStorage = useLocalStorage;
exports.useMediaQuery = useMediaQuery;
exports.useWebSocket = useWebSocket;
exports.useWebSocketListener = useWebSocketListener;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map