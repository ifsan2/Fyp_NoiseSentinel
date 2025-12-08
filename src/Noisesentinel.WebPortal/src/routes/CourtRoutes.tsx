import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import { CourtLayout } from "@/components/court/layout/CourtLayout";

// Dashboard
import { CourtDashboardPage } from "@/pages/court/CourtDashboardPage";

// Courts
import { ViewCourtsPage } from "@/pages/court/courts/ViewCourtsPage";
import { CreateCourtPage } from "@/pages/court/courts/CreateCourtPage";

// Judges
import { ViewJudgesPage } from "@/pages/court/judges/ViewJudgesPage";
import { CreateJudgePage } from "@/pages/court/judges/CreateJudgePage";

// FIRs
import { ViewFirsPage } from "@/pages/court/firs/ViewFirsPage";

// Cases
import { ViewCasesPage } from "@/pages/court/cases/ViewCasesPage";

// Case Statements
import { ViewCaseStatementsPage } from "@/pages/court/statements/ViewCaseStatementsPage";
import { CaseStatementDetailPage } from "@/pages/court/statements/CaseStatementDetailPage";

// Common Pages
import { ProfilePage } from "@/pages/admin/ProfilePage";
import { ChangePasswordPage } from "@/pages/admin/ChangePasswordPage";

export const CourtRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<CourtLayout />}>
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<CourtDashboardPage />} />

        {/* Courts */}
        <Route path="courts" element={<ViewCourtsPage />} />
        <Route path="courts/create" element={<CreateCourtPage />} />

        {/* Judges */}
        <Route path="judges" element={<ViewJudgesPage />} />
        <Route path="judges/create" element={<CreateJudgePage />} />

        {/* FIRs */}
        <Route path="firs" element={<ViewFirsPage />} />

        {/* Cases */}
        <Route path="cases" element={<ViewCasesPage />} />
        <Route path="cases/create" element={<div>Create Case - TODO</div>} />

        {/* Case Statements */}
        <Route
          path="statements"
          element={<ViewCaseStatementsPage />}
        />
        <Route
          path="statements/detail/:id"
          element={<CaseStatementDetailPage />}
        />

        {/* Profile & Settings */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};
