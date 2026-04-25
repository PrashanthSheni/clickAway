import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("srb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("srb_token");
      // Only redirect if we're not already on the login or auth page to prevent loops
      if (!window.location.pathname.startsWith('/auth') && !window.location.pathname.startsWith('/login')) {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(err);
  }
);

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  if (detail && detail.message) {
    let s = detail.message;
    if (Array.isArray(detail.errors)) {
      s += ": " + detail.errors.map((e) => e.message).join("; ");
    }
    return s;
  }
  return JSON.stringify(detail);
}

export function formatTime12hr(timeStr) {
  if (!timeStr) return "";
  try {
    const [h, m] = timeStr.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  } catch (e) {
    return timeStr;
  }
}
