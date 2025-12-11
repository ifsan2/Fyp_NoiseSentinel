import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import { JudgeLayout } from "@/components/judge/layout/JudgeLayout";

// Dashboard
import { JudgeDashboardPage } from "@/pages/judge/JudgeDashboardPage";

// Cases
import { ViewMyCasesPage } from "@/pages/judge/cases/ViewMyCasesPage";
import { CaseDetailPage } from "@/pages/judge/cases/CaseDetailPage";
import { UpdateCasePage } from "@/pages/judge/cases/UpdateCasePage";

// Case Statements
import { ViewCaseStatementsPage } from "@/pages/judge/statements/ViewCaseStatementsPage";
import { CreateCaseStatementPage } from "@/pages/judge/statements/CreateCaseStatementPage";
import { UpdateCaseStatementPage } from "@/pages/judge/statements/UpdateCaseStatementPage";
import { CaseStatementDetailPage } from "@/pages/court/statements/CaseStatementDetailPage";

// Common Pages
import { ProfilePage } from "@/pages/admin/ProfilePage";
import { ChangePasswordPage } from "@/pages/admin/ChangePasswordPage";

export const JudgeRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<JudgeLayout />}>
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<JudgeDashboardPage />} />

        {/* Cases */}
        <Route path="my-cases" element={<ViewMyCasesPage />} />
        <Route path="cases/detail/:id" element={<CaseDetailPage />} />
        <Route path="cases/update/:id" element={<UpdateCasePage />} />

        {/* Case Statements */}
        <Route path="statements" element={<ViewCaseStatementsPage />} />
        <Route path="statements/create" element={<CreateCaseStatementPage />} />
        <Route path="statements/update/:id" element={<UpdateCaseStatementPage />} />
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
