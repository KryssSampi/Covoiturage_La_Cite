import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import AdminRoute from "./auth/AdminRoute";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Drivers from "./pages/Drivers";
import Rides from "./pages/Rides";
import Reports from "./pages/Reports";
import Statistics from "./pages/Statistics";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import Exports from "./pages/Exports";
import Login from "./pages/Login";
import TestPage from "./pages/Test";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="rides" element={<Rides />} />
          <Route path="reports" element={<Reports />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="logs" element={<Logs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="exports" element={<Exports />} />
          <Route path="test" element={<TestPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
