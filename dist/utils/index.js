'use strict';

var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');

// src/utils/cn.ts
function cn(...inputs) {
  return tailwindMerge.twMerge(clsx.clsx(inputs));
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

exports.cn = cn;
exports.formatBytes = formatBytes;
exports.formatDate = formatDate;
exports.formatDuration = formatDuration;
exports.formatRelativeTime = formatRelativeTime;
exports.formatValidationError = formatValidationError;
exports.isRequired = isRequired;
exports.isValidEmail = isValidEmail;
exports.isValidUrl = isValidUrl;
exports.sanitizeInput = sanitizeInput;
exports.validatePassword = validatePassword;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map