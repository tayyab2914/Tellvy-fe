import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/Sidebar";

// Pages
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminClients from "@/pages/AdminClients";
import AdminStaff from "@/pages/AdminStaff";
import AdminRegions from "@/pages/AdminRegions";
import AdminRedirects from "@/pages/AdminRedirects";
import AdminAuditLog from "@/pages/AdminAuditLog";
import RegionalDashboard from "@/pages/RegionalDashboard";
import RegionalAgents from "@/pages/RegionalAgents";
import RegionalClients from "@/pages/RegionalClients";
import AgentDashboard from "@/pages/AgentDashboard";
import AgentClientDetail from "@/pages/AgentClientDetail";
import RepWizard from "@/pages/RepWizard";
import ClientDashboard from "@/pages/ClientDashboard";
import ClientTeam from "@/pages/ClientTeam";
import ClientReviews from "@/pages/ClientReviews";
import IntentPortal from "@/pages/IntentPortal";
import ReviewPage from "@/pages/ReviewPage";
import NfcRedirect from "@/pages/NfcRedirect";

function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#002FA7]/30 border-t-[#002FA7] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "super_admin") return <Navigate to="/admin" replace />;
    if (user.role === "regional_manager") return <Navigate to="/regional" replace />;
    if (user.role === "sales_agent") return <Navigate to="/agent" replace />;
    return <Navigate to="/client" replace />;
  }

  return <Outlet />;
}

function DashboardLayout({ role }) {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar role={role} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function AuthRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#002FA7]/30 border-t-[#002FA7] rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "super_admin") return <Navigate to="/admin" replace />;
  if (user.role === "regional_manager") return <Navigate to="/regional" replace />;
  if (user.role === "sales_agent") return <Navigate to="/agent" replace />;
  return <Navigate to="/client" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/s/:standeeId" element={<NfcRedirect />} />
          <Route path="/portal/:clientId" element={<IntentPortal />} />
          <Route path="/portal/:clientId/review" element={<ReviewPage />} />

          {/* Auth redirect */}
          <Route path="/" element={<AuthRedirect />} />

          {/* Super Admin */}
          <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
            <Route element={<DashboardLayout role="super_admin" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/clients" element={<AdminClients />} />
              <Route path="/admin/staff" element={<AdminStaff />} />
              <Route path="/admin/regions" element={<AdminRegions />} />
              <Route path="/admin/redirects" element={<AdminRedirects />} />
              <Route path="/admin/audit-log" element={<AdminAuditLog />} />
            </Route>
          </Route>

          {/* Regional Manager */}
          <Route element={<ProtectedRoute allowedRoles={["regional_manager"]} />}>
            <Route element={<DashboardLayout role="regional_manager" />}>
              <Route path="/regional" element={<RegionalDashboard />} />
              <Route path="/regional/agents" element={<RegionalAgents />} />
              <Route path="/regional/clients" element={<RegionalClients />} />
            </Route>
          </Route>

          {/* Sales Agent */}
          <Route element={<ProtectedRoute allowedRoles={["sales_agent"]} />}>
            <Route element={<DashboardLayout role="sales_agent" />}>
              <Route path="/agent" element={<AgentDashboard />} />
              <Route path="/agent/clients/:clientId" element={<AgentClientDetail />} />
              <Route path="/agent/wizard" element={<RepWizard />} />
            </Route>
          </Route>

          {/* Client */}
          <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
            <Route element={<DashboardLayout role="client" />}>
              <Route path="/client" element={<ClientDashboard />} />
              <Route path="/client/team" element={<ClientTeam />} />
              <Route path="/client/reviews" element={<ClientReviews />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
