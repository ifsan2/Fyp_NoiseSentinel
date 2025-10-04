import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthProvider';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterCourtAuthorityPage } from './pages/auth/RegisterCourtAuthorityPage';
import { RegisterStationAuthorityPage } from './pages/auth/RegisterStationAuthorityPage';

// Court Authority Pages
import { CourtDashboard } from './pages/court/CourtDashboard';
import { ManageJudges } from './pages/court/ManageJudges';

// Station Authority Pages
import { StationDashboard } from './pages/station/StationDashboard';
import { ManageOfficers } from './pages/station/ManageOfficers';

// Judge Pages
import { JudgeDashboard } from './pages/judge/JudgeDashboard';

// Error Pages
const UnauthorizedPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-red-600">403</h1>
      <p className="text-2xl text-gray-700 mt-4">Unauthorized Access</p>
      <p className="text-gray-500 mt-2">You don't have permission to access this page.</p>
      <a href="/login" className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        Go to Login
      </a>
    </div>
  </div>
);

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-700">404</h1>
      <p className="text-2xl text-gray-600 mt-4">Page Not Found</p>
      <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
      <a href="/login" className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        Go to Login
      </a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/court-authority" element={<RegisterCourtAuthorityPage />} />
          <Route path="/register/station-authority" element={<RegisterStationAuthorityPage />} />
          
          {/* Court Authority Routes */}
          <Route
            path="/court/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Court Authority']}>
                <CourtDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/court/manage-judges"
            element={
              <ProtectedRoute allowedRoles={['Court Authority']}>
                <ManageJudges />
              </ProtectedRoute>
            }
          />

          {/* Station Authority Routes */}
          <Route
            path="/station/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Station Authority']}>
                <StationDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/station/manage-officers"
            element={
              <ProtectedRoute allowedRoles={['Station Authority']}>
                <ManageOfficers />
              </ProtectedRoute>
            }
          />

          {/* Judge Routes */}
          <Route
            path="/judge/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Judge']}>
                <JudgeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/404" element={<NotFoundPage />} />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch all - 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;