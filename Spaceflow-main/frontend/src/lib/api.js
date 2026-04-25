export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
export const API_BASE = `${BACKEND_URL}/api`;

// MOCK DATA
const mockUser = {
  id: 1,
  email: "admin@company.com",
  name: "Frontend Admin",
  role: "admin",
  is_admin: true
};

const mockResources = [
  { id: 1, name: "Conference Room A", type: "room", capacity: 10, status: "available" },
  { id: 2, name: "Projector B", type: "equipment", capacity: 1, status: "available" },
  { id: 3, name: "Desk 42", type: "desk", capacity: 1, status: "in_use" }
];

const mockBookings = [
  { id: 1, resource_id: 1, user_id: 1, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 3600000).toISOString(), status: "active" }
];

const mockReportsOverview = {
  total_bookings: 150,
  avg_utilization: 78,
  no_show_rate: 4.2,
  total_resources: 45,
  total_users: 120,
  active_bookings: 35,
  utilization_by_resource: [
    { name: "Room A", utilization: 85 },
    { name: "Room B", utilization: 60 },
    { name: "Desk 42", utilization: 90 }
  ],
  bookings_by_day: [
    { date: "Mon", count: 20 },
    { date: "Tue", count: 35 },
    { date: "Wed", count: 45 },
    { date: "Thu", count: 30 },
    { date: "Fri", count: 20 }
  ],
  peak_hours: [
    { hour: "09:00", count: 15 },
    { hour: "10:00", count: 25 },
    { hour: "11:00", count: 30 },
    { hour: "14:00", count: 28 }
  ],
  bookings_by_department: [
    { department: "Engineering", count: 50 },
    { department: "Sales", count: 40 },
    { department: "HR", count: 15 }
  ],
  underutilized_resources: [
    { resource_id: 4, name: "Basement Storage", utilization: 5 }
  ]
};

const mockHierarchy = [
  {
    manager: { id: 2, name: "Alice Manager", department: "Engineering" },
    employees: [
      { id: 3, name: "Bob Dev", email: "bob@company.com", reliability_score: 95 }
    ]
  }
];

const mockUsers = [
  { id: 1, name: "Frontend Admin", email: "admin@company.com", role: "admin", department: "IT", reliability_score: 100, status: "approved" },
  { id: 2, name: "Alice Manager", email: "alice@company.com", role: "manager", department: "Engineering", reliability_score: 98, status: "approved" },
  { id: 3, name: "Bob Dev", email: "bob@company.com", role: "employee", department: "Engineering", reliability_score: 95, status: "pending" }
];

// MOCK AXIOS API
export const api = {
  get: async (url) => {
    console.log("[MOCK API GET]", url);
    if (url === "/auth/me") return { data: mockUser };
    if (url === "/resources") return { data: mockResources };
    if (url === "/bookings") return { data: mockBookings };
    if (url.includes("/reports/overview")) return { data: mockReportsOverview };
    if (url.includes("/users/hierarchy")) return { data: mockHierarchy };
    if (url.includes("/users/pending")) return { data: [mockUsers[2]] };
    if (url === "/users") return { data: mockUsers };
    if (url.includes("/feedback")) return { data: [] };
    if (url.includes("/analytics")) return { data: { total_bookings: 15, active_resources: 10, utilization: 85 } };
    return { data: [] };
  },
  post: async (url, data) => {
    console.log("[MOCK API POST]", url, data);
    if (url === "/auth/login") {
      // Simulate real login payload
      let role = "admin";
      if (data?.email?.includes("manager")) role = "manager";
      if (data?.email?.includes("employee")) role = "employee";
      
      return { 
        data: { 
          access_token: "mock_jwt_token_123", 
          user: { ...mockUser, role, name: `Mock ${role}` } 
        } 
      };
    }
    return { data: { success: true, message: "Mock success" } };
  },
  put: async (url, data) => {
    console.log("[MOCK API PUT]", url, data);
    return { data: { success: true } };
  },
  delete: async (url) => {
    console.log("[MOCK API DELETE]", url);
    return { data: { success: true } };
  },
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  }
};

// MOCK FETCH for Auth.js and other standalone fetches
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  console.log("[MOCK FETCH]", url, options);
  
  if (url.includes("/auth/send-verification-code")) {
    return {
      ok: true,
      json: async () => ({ message: "Mock verification code sent" })
    };
  }
  
  if (url.includes("/auth/register")) {
    return {
      ok: true,
      json: async () => ({ message: "Mock registration successful" })
    };
  }

  // Fallback to original fetch for anything else
  return originalFetch(url, options);
};

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
