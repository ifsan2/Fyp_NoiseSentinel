import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/common/Loading";
import { PrivateRoute } from "./PrivateRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StationRoutes } from "./StationRoutes"; // ✅ ADD
import { ROUTES, ROLES } from "@/utils/constants";

// Auth Pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterAdminPage } from "@/pages/auth/RegisterAdminPage";

// Public Pages
import { PublicChallanSearchPage } from "@/pages/public/PublicChallanSearchPage";

// Admin Pages
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { CreateCourtAuthorityPage } from "@/pages/admin/CreateCourtAuthorityPage";
import { CreateStationAuthorityPage } from "@/pages/admin/CreateStationAuthorityPage";
import { CreateAdminPage } from "@/pages/admin/CreateAdminPage";
import { ViewUsersPage } from "@/pages/admin/ViewUsersPage";
import { ProfilePage } from "@/pages/admin/ProfilePage";
import { ChangePasswordPage } from "@/pages/admin/ChangePasswordPage";

// ✅ Role-Based Redirect Component
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Redirect based on role
  switch (user.role) {
    case ROLES.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;

    case ROLES.COURT_AUTHORITY:
      return <Navigate to="/court/dashboard" replace />;

    case ROLES.STATION_AUTHORITY:
      return <Navigate to="/station/dashboard" replace />; // ✅ Station Authority

    case ROLES.JUDGE:
      return <Navigate to="/judge/dashboard" replace />;

    case ROLES.POLICE_OFFICER:
      return <Navigate to={ROUTES.LOGIN} replace />;

    default:
      return <Navigate to={ROUTES.LOGIN} replace />;
  }
};

export const AppRouter: React.FC = () => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <Loading message="Loading application..." fullScreen />;
  }

  const webRoles = [
    ROLES.ADMIN,
    ROLES.COURT_AUTHORITY,
    ROLES.STATION_AUTHORITY,
    ROLES.JUDGE,
  ];

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path={ROUTES.LOGIN}
          element={
            isAuthenticated && user && webRoles.includes(user.role) ? (
              <RoleBasedRedirect />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path={ROUTES.REGISTER_ADMIN}
          element={
            isAuthenticated && user?.role === ROLES.ADMIN ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <RegisterAdminPage />
            )
          }
        />

        {/* Public Challan Search - No Authentication Required */}
        <Route path="/search-challans" element={<PublicChallanSearchPage />} />

        {/* Root Route - Role-Based Redirect */}
        <Route
          path="/"
          element={
            <PrivateRoute allowedRoles={webRoles}>
              <RoleBasedRedirect />
            </PrivateRoute>
          }
        />

        {/* ========== ADMIN ROUTES ========== */}
        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole={ROLES.ADMIN}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="view-users" element={<ViewUsersPage />} />
          <Route
            path="create-court-authority"
            element={<CreateCourtAuthorityPage />}
          />
          <Route
            path="create-station-authority"
            element={<CreateStationAuthorityPage />}
          />
          <Route path="create-admin" element={<CreateAdminPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* ========== COURT AUTHORITY ROUTES ========== */}
        <Route
          path="/court"
          element={
            <PrivateRoute requiredRole={ROLES.COURT_AUTHORITY}>
              <CourtAuthorityPlaceholder />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/court/dashboard" replace />} />
          <Route path="dashboard" element={<CourtDashboardPlaceholder />} />
        </Route>

        {/* ========== STATION AUTHORITY ROUTES ========== */}
        <Route
          path="/station/*"
          element={
            <PrivateRoute requiredRole={ROLES.STATION_AUTHORITY}>
              <StationRoutes />
            </PrivateRoute>
          }
        />

        {/* ========== JUDGE ROUTES ========== */}
        <Route
          path="/judge"
          element={
            <PrivateRoute requiredRole={ROLES.JUDGE}>
              <JudgePlaceholder />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/judge/dashboard" replace />} />
          <Route path="dashboard" element={<JudgeDashboardPlaceholder />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<RoleBasedRedirect />} />
      </Routes>
    </BrowserRouter>
  );
};

// ✅ Placeholder components (temporary)
const CourtAuthorityPlaceholder: React.FC = () => {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>🏛️ Court Authority Portal</h1>
      <p>Coming Soon...</p>
    </div>
  );
};

const CourtDashboardPlaceholder: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>🏛️ Court Authority Dashboard</h1>
      <p>Welcome, {user?.fullName}!</p>
      <p>Role: {user?.role}</p>
      <p>This dashboard is under construction.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const JudgePlaceholder: React.FC = () => {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>⚖️ Judge Portal</h1>
      <p>Coming Soon...</p>
    </div>
  );
};

const JudgeDashboardPlaceholder: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>⚖️ Judge Dashboard</h1>
      <p>Welcome, {user?.fullName}!</p>
      <p>Role: {user?.role}</p>
      <p>This dashboard is under construction.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
