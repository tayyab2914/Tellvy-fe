import React, { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/Sidebar";
import { Menu, X } from "lucide-react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - hidden on mobile by default */}
      <div className={`fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <Sidebar role={role} onClose={closeSidebar} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-auto w-full">
        {/* Mobile header with hamburger */}
        <div className="md:hidden sticky top-0 z-20 flex items-center bg-white border-b border-zinc-200 px-4 py-3">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-zinc-600" />
            ) : (
              <Menu className="w-5 h-5 text-zinc-600" />
            )}
          </button>
          <span className="ml-3 font-heading text-lg font-medium text-[#09090B]">Tellvy</span>
        </div>

        {/* Page content */}
        <div className="flex-1">
          <Outlet />
        </div>
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
