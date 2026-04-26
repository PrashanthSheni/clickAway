import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Solutions from "./pages/Solutions";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import BrowseResources from "./pages/BrowseResources";
import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";
import BookingDetail from "./pages/BookingDetail";
import CalendarView from "./pages/CalendarView";
import FloorMap from "./pages/FloorMap";
import CheckIn from "./pages/CheckIn";
import ManagerDashboard from "./pages/ManagerDashboard";
import ApprovalQueue from "./pages/ApprovalQueue";
import TeamCalendar from "./pages/TeamCalendar";
import AdminDashboard from "./pages/AdminDashboard";
import ResourceManagement from "./pages/ResourceManagement";
import PolicyConfiguration from "./pages/PolicyConfiguration";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import AllBookings from "./pages/AllBookings";
import ResourceCalendar from "./pages/ResourceCalendar";
import EmployeeProfile from "./pages/EmployeeProfile";
import NotificationsPanel from "./pages/NotificationsPanel";
import Settings from "./pages/Settings";
import Support from "./pages/Support";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role === "admin") return <AdminDashboard />;
  if (user.role === "manager") return <ManagerDashboard />;
  return <EmployeeDashboard />;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Toaster position="top-right" richColors />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<HomeRedirect />} />
                <Route path="browse" element={<BrowseResources />} />
                <Route path="book/:resourceId" element={<BookingForm />} />
                <Route path="bookings" element={<MyBookings />} />
                <Route path="bookings/:id" element={<BookingDetail />} />
                <Route path="calendar" element={<CalendarView />} />
                <Route path="floor-map" element={<FloorMap />} />
                <Route path="checkin" element={<CheckIn />} />
                <Route path="profile" element={<EmployeeProfile />} />
                <Route path="notifications" element={<NotificationsPanel />} />
                <Route path="settings" element={<Settings />} />
                <Route path="support" element={<Support />} />
                <Route path="resource/:resourceId/calendar" element={<ResourceCalendar />} />

                <Route
                  path="manager/approvals"
                  element={
                    <ProtectedRoute roles={["manager", "admin"]}>
                      <ApprovalQueue />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="manager/team-calendar"
                  element={
                    <ProtectedRoute roles={["manager", "admin"]}>
                      <TeamCalendar />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="admin"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/resources"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ResourceManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/policies"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <PolicyConfiguration />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/bookings"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AllBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/reports"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ReportsAnalytics />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
