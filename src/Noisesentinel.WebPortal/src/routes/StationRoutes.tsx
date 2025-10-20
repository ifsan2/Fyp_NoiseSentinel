import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import { StationLayout } from "@/components/station/layout/StationLayout";

// Dashboard
import { StationDashboardPage } from "@/pages/station/StationDashboardPage";

// Police Stations
import { ViewStationsPage } from "@/pages/station/stations/ViewStationsPage";
import { CreateStationPage } from "@/pages/station/stations/CreateStationPage";
import { EditStationPage } from "@/pages/station/stations/EditStationPage";
import { StationDetailPage } from "@/pages/station/stations/StationDetailPage";

// Police Officers
import { ViewOfficersPage } from "@/pages/station/officers/ViewOfficersPage";
import { CreateOfficerPage } from "@/pages/station/officers/CreateOfficerPage";
import { EditOfficerPage } from "@/pages/station/officers/EditOfficerPage";
import { TransferOfficerPage } from "@/pages/station/officers/TransferOfficerPage";
import { OfficerDetailPage } from "@/pages/station/officers/OfficerDetailPage";

// IoT Devices
import { ViewDevicesPage } from "@/pages/station/devices/ViewDevicesPage";
import { RegisterDevicePage } from "@/pages/station/devices/RegisterDevicePage";
import { EditDevicePage } from "@/pages/station/devices/EditDevicePage";

// Violations
import { ViewViolationsPage } from "@/pages/station/violations/ViewViolationsPage";
import { CreateViolationPage } from "@/pages/station/violations/CreateViolationPage";
import { EditViolationPage } from "@/pages/station/violations/EditViolationPage";

// Monitoring Pages ✅
import { ViewChallansPage } from "@/pages/station/monitoring/ViewChallansPage";
import { ViewFirsPage } from "@/pages/station/monitoring/ViewFirsPage";
import { ViewVehiclesPage } from "@/pages/station/monitoring/ViewVehiclesPage";
import { ViewAccusedPage } from "@/pages/station/monitoring/ViewAccusedPage";

// Common Pages
import { ProfilePage } from "@/pages/admin/ProfilePage";
import { ChangePasswordPage } from "@/pages/admin/ChangePasswordPage";

export const StationRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<StationLayout />}>
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<StationDashboardPage />} />

        {/* Police Stations */}
        <Route path="stations" element={<ViewStationsPage />} />
        <Route path="stations/create" element={<CreateStationPage />} />
        <Route path="stations/edit/:id" element={<EditStationPage />} />
        <Route path="stations/detail/:id" element={<StationDetailPage />} />

        {/* Police Officers */}
        <Route path="officers" element={<ViewOfficersPage />} />
        <Route path="officers/create" element={<CreateOfficerPage />} />
        <Route path="officers/edit/:officerId" element={<EditOfficerPage />} />
        <Route
          path="officers/transfer/:officerId"
          element={<TransferOfficerPage />}
        />
        <Route path="officers/detail/:userId" element={<OfficerDetailPage />} />

        {/* IoT Devices */}
        <Route path="devices" element={<ViewDevicesPage />} />
        <Route path="devices/register" element={<RegisterDevicePage />} />
        <Route path="devices/edit/:deviceId" element={<EditDevicePage />} />

        {/* Violations */}
        <Route path="violations" element={<ViewViolationsPage />} />
        <Route path="violations/create" element={<CreateViolationPage />} />
        <Route
          path="violations/edit/:violationId"
          element={<EditViolationPage />}
        />

        {/* Monitoring Pages ✅ */}
        <Route path="challans" element={<ViewChallansPage />} />
        <Route path="firs" element={<ViewFirsPage />} />
        <Route path="vehicles" element={<ViewVehiclesPage />} />
        <Route path="accused" element={<ViewAccusedPage />} />

        {/* Settings */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};
