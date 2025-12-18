import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import { CourtLayout } from "@/components/court/layout/CourtLayout";

// Dashboard
import { CourtDashboardPage } from "@/pages/court/CourtDashboardPage";

// Courts
import { ViewCourtsPage } from "@/pages/court/courts/ViewCourtsPage";
import { CreateCourtPage } from "@/pages/court/courts/CreateCourtPage";
import { EditCourtPage } from "@/pages/court/courts/EditCourtPage";
import { CourtDetailPage } from "@/pages/court/courts/CourtDetailPage";

// Judges
import { ViewJudgesPage } from "@/pages/court/judges/ViewJudgesPage";
import { CreateJudgePage } from "@/pages/court/judges/CreateJudgePage";
import { EditJudgePage } from "@/pages/court/judges/EditJudgePage";
import { JudgeDetailPage } from "@/pages/court/judges/JudgeDetailPage";

// FIRs
import { ViewFirsPage } from "@/pages/court/firs/ViewFirsPage";
import { FirDetailPage } from "@/pages/court/firs/FirDetailPage";

// Cases
import { ViewCasesPage } from "@/pages/court/cases/ViewCasesPage";
import { CreateCasePage } from "@/pages/court/cases/CreateCasePage";
import { CaseDetailPage } from "@/pages/court/cases/CaseDetailPage";

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
        <Route path="courts/edit/:id" element={<EditCourtPage />} />
        <Route path="courts/detail/:id" element={<CourtDetailPage />} />

        {/* Judges */}
        <Route path="judges" element={<ViewJudgesPage />} />
        <Route path="judges/create" element={<CreateJudgePage />} />
        <Route path="judges/edit/:judgeId" element={<EditJudgePage />} />
        <Route path="judges/detail/:judgeId" element={<JudgeDetailPage />} />

        {/* FIRs */}
        <Route path="firs" element={<ViewFirsPage />} />
        <Route path="firs/detail/:firId" element={<FirDetailPage />} />

        {/* Cases */}
        <Route path="cases" element={<ViewCasesPage />} />
        <Route path="cases/create" element={<CreateCasePage />} />
        <Route path="cases/detail/:id" element={<CaseDetailPage />} />

        {/* Case Statements */}
        <Route path="statements" element={<ViewCaseStatementsPage />} />
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
