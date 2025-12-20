import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Link,
} from "@mui/material";
import {
  Search as SearchIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  ExpandMore as ExpandMoreIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  LocalPolice as PoliceIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import publicStatusApi, {
  PublicCaseStatusResponseDto,
} from "@/api/publicStatusApi";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { format } from "date-fns";

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = "noisesentinel_public_session";

interface StoredSession {
  accessToken: string;
  formData: OtpRequestFormData;
  expiresAt: string;
}

// ============================================================================
// TYPES
// ============================================================================

interface OtpRequestFormData {
  vehicleNo: string;
  cnic: string;
  email: string;
}

interface OtpVerifyFormData {
  otp: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PublicCaseStatusPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Step management
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form data persistence
  const [formData, setFormData] = useState<OtpRequestFormData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [caseStatus, setCaseStatus] =
    useState<PublicCaseStatusResponseDto | null>(null);

  // Tab for results view
  const [tabValue, setTabValue] = useState(0);

  const steps = ["Enter Details", "Verify OTP", "View Status"];

  // Form for Step 1 - Request OTP
  const requestForm = useForm<OtpRequestFormData>({
    defaultValues: {
      vehicleNo: "",
      cnic: "",
      email: "",
    },
  });

  // Form for Step 2 - Verify OTP
  const verifyForm = useForm<OtpVerifyFormData>({
    defaultValues: {
      otp: "",
    },
  });

  // ============================================================================
  // SESSION PERSISTENCE
  // ============================================================================

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const session: StoredSession = JSON.parse(stored);

          // Check if session is expired
          if (new Date(session.expiresAt) > new Date()) {
            // Try to fetch case status with stored token
            const statusResponse = await publicStatusApi.getCaseStatus(
              session.accessToken
            );

            if (statusResponse.success && statusResponse.data) {
              setAccessToken(session.accessToken);
              setFormData(session.formData);
              setCaseStatus(statusResponse.data);
              setActiveStep(2);
              enqueueSnackbar("Session restored successfully!", {
                variant: "success",
              });
            } else {
              // Session invalid, clear storage
              localStorage.removeItem(STORAGE_KEY);
            }
          } else {
            // Session expired, clear storage
            localStorage.removeItem(STORAGE_KEY);
            enqueueSnackbar("Your previous session has expired.", {
              variant: "info",
            });
          }
        }
      } catch (error) {
        console.error("Error loading session:", error);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setInitialLoading(false);
      }
    };

    loadSession();
  }, [enqueueSnackbar]);

  // Save session to localStorage when token is obtained
  const saveSession = (
    token: string,
    data: OtpRequestFormData,
    expiresAt: string
  ) => {
    const session: StoredSession = {
      accessToken: token,
      formData: data,
      expiresAt: expiresAt,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  };

  // Clear session from localStorage
  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRequestOtp = async (data: OtpRequestFormData) => {
    try {
      setLoading(true);
      const response = await publicStatusApi.requestStatusOtp({
        vehicleNo: data.vehicleNo.trim(),
        cnic: data.cnic.trim(),
        email: data.email.trim().toLowerCase(),
      });

      if (response.success) {
        setFormData(data);
        setActiveStep(1);
        enqueueSnackbar(response.message || "OTP sent successfully!", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(response.message || "Failed to send OTP", {
          variant: "error",
        });
      }
    } catch (error: any) {
      console.error("OTP request error:", error);
      enqueueSnackbar(
        error.response?.data?.message ||
          "Failed to send OTP. Please check your details.",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpVerifyFormData) => {
    if (!formData) return;

    try {
      setLoading(true);
      const response = await publicStatusApi.verifyStatusOtp({
        vehicleNo: formData.vehicleNo.trim(),
        cnic: formData.cnic.trim(),
        email: formData.email.trim().toLowerCase(),
        otp: data.otp.trim(),
      });

      if (response.success && response.accessToken) {
        setAccessToken(response.accessToken);

        // Save session to localStorage
        saveSession(response.accessToken, formData, response.expiresAt);

        // Fetch case status
        const statusResponse = await publicStatusApi.getCaseStatus(
          response.accessToken
        );
        if (statusResponse.success && statusResponse.data) {
          setCaseStatus(statusResponse.data);
          setActiveStep(2);
          enqueueSnackbar("Verification successful!", { variant: "success" });
        }
      } else {
        enqueueSnackbar(response.message || "Invalid OTP", {
          variant: "error",
        });
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      enqueueSnackbar(
        error.response?.data?.message ||
          "Invalid or expired OTP. Please try again.",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // PDF GENERATION
  // ============================================================================

  const generatePDFReport = () => {
    if (!caseStatus) return;

    const formatDateForPrint = (dateString?: string) => {
      if (!dateString) return "N/A";
      try {
        return new Date(dateString).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch {
        return dateString;
      }
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Case Status Report - ${caseStatus.vehiclePlateNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11px;
              line-height: 1.5;
              color: #000;
              background: white;
            }
            .page {
              width: 210mm;
              margin: 0 auto;
              padding: 20px;
              background: white;
            }
            
            /* Header */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #1e3a8a;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 15px;
            }
            .logo {
              font-size: 48px;
            }
            .header-title h1 {
              font-size: 24px;
              color: #1e3a8a;
              margin-bottom: 4px;
            }
            .header-title p {
              font-size: 12px;
              color: #666;
            }
            .header-right {
              text-align: right;
              font-size: 10px;
              color: #666;
            }
            
            /* Summary Section */
            .summary-section {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 25px;
            }
            .summary-card {
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            .summary-card.danger { border-color: #ef4444; background: #fef2f2; }
            .summary-card.warning { border-color: #f59e0b; background: #fffbeb; }
            .summary-card.info { border-color: #3b82f6; background: #eff6ff; }
            .summary-card.success { border-color: #22c55e; background: #f0fdf4; }
            .summary-label { font-size: 10px; color: #666; margin-bottom: 5px; }
            .summary-value { font-size: 24px; font-weight: bold; }
            .summary-card.danger .summary-value { color: #dc2626; }
            .summary-card.warning .summary-value { color: #d97706; }
            .summary-card.info .summary-value { color: #2563eb; }
            .summary-card.success .summary-value { color: #16a34a; }
            
            /* Personal Info */
            .info-section {
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 25px;
            }
            .info-section h2 {
              font-size: 14px;
              color: #1e3a8a;
              border-bottom: 2px solid #1e3a8a;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .info-item label {
              font-size: 10px;
              color: #666;
              display: block;
            }
            .info-item span {
              font-size: 12px;
              font-weight: 600;
            }
            
            /* Section Headers */
            .section-header {
              background: #1e3a8a;
              color: white;
              padding: 10px 15px;
              font-size: 14px;
              font-weight: bold;
              margin-top: 25px;
              margin-bottom: 15px;
              border-radius: 4px;
            }
            
            /* Tables */
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 10px;
            }
            .data-table th {
              background: #f3f4f6;
              border: 1px solid #d1d5db;
              padding: 8px;
              text-align: left;
              font-weight: 600;
            }
            .data-table td {
              border: 1px solid #d1d5db;
              padding: 8px;
            }
            .data-table tr:nth-child(even) {
              background: #f9fafb;
            }
            
            /* Status Badges */
            .badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 9px;
              font-weight: bold;
            }
            .badge-success { background: #dcfce7; color: #166534; }
            .badge-error { background: #fee2e2; color: #991b1b; }
            .badge-warning { background: #fef3c7; color: #92400e; }
            .badge-info { background: #dbeafe; color: #1e40af; }
            
            /* Case Cards */
            .case-card {
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              margin-bottom: 15px;
              overflow: hidden;
            }
            .case-card-header {
              background: #f3f4f6;
              padding: 10px 15px;
              border-bottom: 1px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .case-card-header h3 {
              font-size: 13px;
              color: #1e3a8a;
            }
            .case-card-body {
              padding: 15px;
            }
            .case-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              margin-bottom: 10px;
            }
            
            /* Statements */
            .statement-box {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              padding: 10px;
              margin-top: 10px;
            }
            .statement-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 10px;
            }
            .statement-header strong { color: #1e3a8a; }
            .statement-header span { color: #666; }
            .statement-text {
              font-size: 10px;
              line-height: 1.4;
            }
            
            /* Verdict */
            .verdict-box {
              background: #dbeafe;
              border: 2px solid #3b82f6;
              border-radius: 4px;
              padding: 10px;
              margin-top: 10px;
            }
            .verdict-box strong {
              color: #1e40af;
              font-size: 10px;
            }
            
            /* No Data */
            .no-data {
              text-align: center;
              padding: 30px;
              color: #22c55e;
              font-size: 12px;
              background: #f0fdf4;
              border-radius: 4px;
            }
            
            /* Footer */
            .footer {
              border-top: 2px solid #e5e7eb;
              margin-top: 30px;
              padding-top: 15px;
              text-align: center;
              font-size: 9px;
              color: #666;
            }
            
            /* Print */
            @media print {
              body { padding: 0; }
              .page { width: 100%; padding: 15px; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <!-- Header -->
            <div class="header">
              <div class="header-left">
                <div class="logo">🛡️</div>
                <div class="header-title">
                  <h1>NoiseSentinel</h1>
                  <p>Comprehensive Case Status Report</p>
                </div>
              </div>
              <div class="header-right">
                <p>Generated: ${new Date().toLocaleString("en-GB")}</p>
                <p>Vehicle: <strong>${
                  caseStatus.vehiclePlateNumber
                }</strong></p>
                <p>CNIC: <strong>${caseStatus.cnic}</strong></p>
              </div>
            </div>
            
            <!-- Summary Cards -->
            <div class="summary-section">
              <div class="summary-card info">
                <div class="summary-label">Total Challans</div>
                <div class="summary-value">${caseStatus.totalChallans}</div>
              </div>
              <div class="summary-card danger">
                <div class="summary-label">Unpaid Challans</div>
                <div class="summary-value">${caseStatus.unpaidChallans}</div>
              </div>
              <div class="summary-card warning">
                <div class="summary-label">Total FIRs</div>
                <div class="summary-value">${caseStatus.totalFirs}</div>
              </div>
              <div class="summary-card ${
                caseStatus.activeCases > 0 ? "warning" : "success"
              }">
                <div class="summary-label">Active Cases</div>
                <div class="summary-value">${caseStatus.activeCases}</div>
              </div>
            </div>
            
            <!-- Financial Summary -->
            <div class="info-section">
              <h2>💰 Financial Summary</h2>
              <div class="info-grid">
                <div class="info-item">
                  <label>Total Penalty Amount</label>
                  <span>PKR ${caseStatus.totalPenaltyAmount.toLocaleString()}</span>
                </div>
                <div class="info-item">
                  <label>Unpaid Amount</label>
                  <span style="color: #dc2626;">PKR ${caseStatus.unpaidPenaltyAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <!-- Personal & Vehicle Info -->
            <div class="info-section">
              <h2>👤 Personal & Vehicle Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <label>Full Name</label>
                  <span>${caseStatus.accusedName}</span>
                </div>
                <div class="info-item">
                  <label>CNIC</label>
                  <span>${caseStatus.cnic}</span>
                </div>
                <div class="info-item">
                  <label>Contact</label>
                  <span>${caseStatus.contact || "N/A"}</span>
                </div>
                <div class="info-item">
                  <label>Address</label>
                  <span>${
                    [caseStatus.address, caseStatus.city, caseStatus.province]
                      .filter(Boolean)
                      .join(", ") || "N/A"
                  }</span>
                </div>
                <div class="info-item">
                  <label>Vehicle Plate Number</label>
                  <span>${caseStatus.vehiclePlateNumber}</span>
                </div>
                <div class="info-item">
                  <label>Vehicle Details</label>
                  <span>${
                    [caseStatus.vehicleMake, caseStatus.vehicleColor]
                      .filter(Boolean)
                      .join(" - ") || "N/A"
                  }</span>
                </div>
              </div>
            </div>
            
            <!-- CHALLANS SECTION -->
            <div class="section-header">📋 CHALLANS (${
              caseStatus.challans.length
            })</div>
            ${
              caseStatus.challans.length === 0
                ? `
              <div class="no-data">✅ No challans found - Great record!</div>
            `
                : `
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Challan ID</th>
                    <th>Violation Type</th>
                    <th>Station</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Penalty</th>
                    <th>Status</th>
                    <th>Flags</th>
                  </tr>
                </thead>
                <tbody>
                  ${caseStatus.challans
                    .map(
                      (challan) => `
                    <tr>
                      <td><strong>#${challan.challanId}</strong></td>
                      <td>${challan.violationType}</td>
                      <td>${challan.stationName}</td>
                      <td>${formatDateForPrint(challan.issueDateTime)}</td>
                      <td>${formatDateForPrint(challan.dueDateTime)}</td>
                      <td><strong>PKR ${challan.penaltyAmount.toLocaleString()}</strong></td>
                      <td>
                        <span class="badge ${
                          challan.status.toLowerCase() === "paid"
                            ? "badge-success"
                            : "badge-error"
                        }">
                          ${challan.status}
                        </span>
                      </td>
                      <td>
                        ${
                          challan.isOverdue
                            ? '<span class="badge badge-error">Overdue</span> '
                            : ""
                        }
                        ${
                          challan.isCognizable
                            ? '<span class="badge badge-warning">Cognizable</span> '
                            : ""
                        }
                        ${
                          challan.hasFir
                            ? '<span class="badge badge-info">FIR Filed</span>'
                            : ""
                        }
                      </td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
            }
            
            <!-- FIRs SECTION -->
            <div class="section-header">🚔 FIRs (${
              caseStatus.firs.length
            })</div>
            ${
              caseStatus.firs.length === 0
                ? `
              <div class="no-data">✅ No FIRs found - Great record!</div>
            `
                : `
              <table class="data-table">
                <thead>
                  <tr>
                    <th>FIR No</th>
                    <th>Date Filed</th>
                    <th>Station</th>
                    <th>Related Challan</th>
                    <th>Status</th>
                    <th>Case Filed</th>
                  </tr>
                </thead>
                <tbody>
                  ${caseStatus.firs
                    .map(
                      (fir) => `
                    <tr>
                      <td><strong>${fir.firNo}</strong></td>
                      <td>${formatDateForPrint(fir.dateFiled)}</td>
                      <td>${fir.stationName}</td>
                      <td>#${fir.relatedChallanId}</td>
                      <td>
                        <span class="badge ${
                          fir.status.toLowerCase() === "closed"
                            ? "badge-success"
                            : "badge-warning"
                        }">
                          ${fir.status}
                        </span>
                      </td>
                      <td>${
                        fir.hasCase
                          ? '<span class="badge badge-info">Yes</span>'
                          : '<span class="badge badge-success">No</span>'
                      }</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
            }
            
            <!-- CASES SECTION -->
            <div class="section-header">⚖️ COURT CASES (${
              caseStatus.cases.length
            })</div>
            ${
              caseStatus.cases.length === 0
                ? `
              <div class="no-data">✅ No court cases found - Great record!</div>
            `
                : caseStatus.cases
                    .map(
                      (caseItem) => `
              <div class="case-card">
                <div class="case-card-header">
                  <h3>${caseItem.caseNo}</h3>
                  <span class="badge ${
                    caseItem.caseStatus.toLowerCase() === "closed" ||
                    caseItem.caseStatus.toLowerCase() === "resolved"
                      ? "badge-success"
                      : "badge-warning"
                  }">
                    ${caseItem.caseStatus}
                  </span>
                </div>
                <div class="case-card-body">
                  <div class="case-grid">
                    <div class="info-item">
                      <label>Case Type</label>
                      <span>${caseItem.caseType}</span>
                    </div>
                    <div class="info-item">
                      <label>Related FIR</label>
                      <span>${caseItem.firNo}</span>
                    </div>
                    <div class="info-item">
                      <label>Court</label>
                      <span>${caseItem.courtName}</span>
                    </div>
                    <div class="info-item">
                      <label>Judge</label>
                      <span>${caseItem.judgeName}</span>
                    </div>
                    ${
                      caseItem.hearingDate
                        ? `
                      <div class="info-item">
                        <label>Next Hearing</label>
                        <span style="color: #d97706;">${formatDateForPrint(
                          caseItem.hearingDate
                        )}</span>
                      </div>
                    `
                        : ""
                    }
                  </div>
                  
                  ${
                    caseItem.verdict
                      ? `
                    <div class="verdict-box">
                      <strong>📜 Verdict:</strong>
                      <p style="margin-top: 5px;">${caseItem.verdict}</p>
                    </div>
                  `
                      : ""
                  }
                  
                  ${
                    caseItem.statements.length > 0
                      ? `
                    <div style="margin-top: 15px;">
                      <strong style="font-size: 11px; color: #1e3a8a;">📝 Statements (${
                        caseItem.statements.length
                      })</strong>
                      ${caseItem.statements
                        .map(
                          (stmt) => `
                        <div class="statement-box">
                          <div class="statement-header">
                            <strong>${stmt.statementBy}</strong>
                            <span>${formatDateForPrint(
                              stmt.statementDate
                            )}</span>
                          </div>
                          <div class="statement-text">${
                            stmt.statementText
                          }</div>
                        </div>
                      `
                        )
                        .join("")}
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            `
                    )
                    .join("")
            }
            
            <!-- Footer -->
            <div class="footer">
              <p><strong>NoiseSentinel</strong> - Traffic Violation Management System</p>
              <p>This is an official case status report. For any queries, please contact your local police station.</p>
              <p>Report generated on ${new Date().toLocaleString("en-GB")}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return html;
  };

  const handleDownload = () => {
    if (!caseStatus) return;

    try {
      setLoading(true);

      const html = generatePDFReport();
      if (!html) {
        enqueueSnackbar("Failed to generate report", { variant: "error" });
        return;
      }

      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        enqueueSnackbar("Please allow popups to download the report", {
          variant: "warning",
        });
        return;
      }

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
      }, 500);

      enqueueSnackbar("Print dialog opened - Save as PDF to download", {
        variant: "info",
      });
    } catch (error: any) {
      console.error("Download error:", error);
      enqueueSnackbar("Failed to generate report", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Navigate to search challans with data
  const handleNavigateToSearchChallans = () => {
    if (formData) {
      // Store data in sessionStorage for search-challans page
      sessionStorage.setItem(
        "challan_search_data",
        JSON.stringify({
          plateNumber: formData.vehicleNo,
          cnic: formData.cnic,
        })
      );
    }
    navigate("/search-challans");
  };

  const handleLogout = () => {
    clearSession();
    setActiveStep(0);
    setFormData(null);
    setAccessToken(null);
    setCaseStatus(null);
    requestForm.reset();
    verifyForm.reset();
    enqueueSnackbar("Logged out successfully", { variant: "info" });
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData(null);
    requestForm.reset();
    verifyForm.reset();
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number) => {
    return `PKR ${(amount || 0).toLocaleString()}`;
  };

  const getStatusColor = (status?: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (
      statusLower === "paid" ||
      statusLower === "closed" ||
      statusLower === "resolved"
    )
      return "success";
    if (statusLower === "pending" || statusLower === "in progress")
      return "warning";
    if (statusLower === "unpaid" || statusLower === "overdue") return "error";
    return "default";
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (initialLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={48} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading...
          </Typography>
        </Box>
      </Box>
    );
  }

  // ============================================================================
  // STEP 1: REQUEST OTP FORM
  // ============================================================================

  const renderStep1 = () => (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 3, sm: 4 },
        maxWidth: 500,
        mx: "auto",
        borderRadius: 3,
      }}
    >
      <Box textAlign="center" mb={3}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <LockIcon sx={{ fontSize: 32, color: "white" }} />
        </Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Identity Verification
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your details to receive a verification code on your registered
          email.
        </Typography>
      </Box>

      <form onSubmit={requestForm.handleSubmit(handleRequestOtp)}>
        <Controller
          name="vehicleNo"
          control={requestForm.control}
          rules={{ required: "Vehicle number is required" }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Vehicle Number"
              placeholder="e.g., ABC-1234"
              error={!!error}
              helperText={error?.message}
              InputProps={{
                startAdornment: (
                  <CarIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              sx={{ mb: 2.5 }}
            />
          )}
        />

        <Controller
          name="cnic"
          control={requestForm.control}
          rules={{
            required: "CNIC is required",
            pattern: {
              value: /^[0-9]{5}-[0-9]{7}-[0-9]$/,
              message: "CNIC format: 12345-1234567-1",
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="CNIC"
              placeholder="12345-1234567-1"
              error={!!error}
              helperText={error?.message}
              InputProps={{
                startAdornment: (
                  <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              sx={{ mb: 2.5 }}
            />
          )}
        />

        <Controller
          name="email"
          control={requestForm.control}
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email format",
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Registered Email"
              placeholder="your.email@example.com"
              type="email"
              error={!!error}
              helperText={error?.message}
              InputProps={{
                startAdornment: (
                  <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              sx={{ mb: 3 }}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
          }}
          startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
        >
          {loading ? "Sending OTP..." : "Send Verification Code"}
        </Button>
      </form>

      {/* Link to search challans */}
      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary">
          OR
        </Typography>
      </Divider>

      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Just want to search for challans?
        </Typography>
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={handleNavigateToSearchChallans}
          sx={{ textTransform: "none" }}
        >
          Search Challans
        </Button>
      </Box>
    </Paper>
  );

  // ============================================================================
  // STEP 2: VERIFY OTP FORM
  // ============================================================================

  const renderStep2 = () => (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 3, sm: 4 },
        maxWidth: 420,
        mx: "auto",
        borderRadius: 3,
      }}
    >
      <Box textAlign="center" mb={3}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "success.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <EmailIcon sx={{ fontSize: 32, color: "white" }} />
        </Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Enter Verification Code
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        A 6-digit verification code has been sent to{" "}
        <strong>{formData?.email}</strong>. The code is valid for 15 minutes.
      </Alert>

      <form onSubmit={verifyForm.handleSubmit(handleVerifyOtp)}>
        <Controller
          name="otp"
          control={verifyForm.control}
          rules={{
            required: "OTP is required",
            minLength: { value: 6, message: "OTP must be 6 digits" },
            maxLength: { value: 6, message: "OTP must be 6 digits" },
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Verification Code"
              placeholder="000000"
              error={!!error}
              helperText={error?.message}
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: "center",
                  letterSpacing: "12px",
                  fontSize: "28px",
                  fontWeight: "bold",
                },
              }}
              sx={{ mb: 3 }}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
          }}
          startIcon={
            loading ? <CircularProgress size={20} /> : <CheckCircleIcon />
          }
        >
          {loading ? "Verifying..." : "Verify & View Status"}
        </Button>

        <Button
          variant="text"
          fullWidth
          onClick={handleReset}
          sx={{ mt: 2, textTransform: "none" }}
        >
          ← Back to Start
        </Button>
      </form>
    </Paper>
  );

  // ============================================================================
  // STEP 3: CASE STATUS VIEW
  // ============================================================================

  const renderStep3 = () => {
    if (!caseStatus) return null;

    return (
      <Box>
        {/* Header with Actions */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                📋 Case Status Report
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Vehicle: <strong>{caseStatus.vehiclePlateNumber}</strong> |
                CNIC: <strong>{caseStatus.cnic}</strong>
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Last updated: {formatDateTime(new Date().toISOString())}
              </Typography>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={loading}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }}
              >
                Download
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<SearchIcon />}
                onClick={handleNavigateToSearchChallans}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }}
              >
                Search Challans
              </Button>
              <Button
                variant="contained"
                size="small"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #1a237e 0%, #283593 100%)"
                    : "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <ReceiptIcon
                    color="primary"
                    sx={{ fontSize: { xs: 20, sm: 24 } }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Challans
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
                >
                  {caseStatus.totalChallans}
                </Typography>
                <Chip
                  size="small"
                  label={`${caseStatus.unpaidChallans} unpaid`}
                  color="error"
                  sx={{ mt: 1, fontSize: "0.7rem" }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #e65100 0%, #f57c00 100%)"
                    : "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PoliceIcon
                    color="warning"
                    sx={{ fontSize: { xs: 20, sm: 24 } }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    FIRs
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
                >
                  {caseStatus.totalFirs}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #006064 0%, #00838f 100%)"
                    : "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <GavelIcon
                    color="info"
                    sx={{ fontSize: { xs: 20, sm: 24 } }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Active Cases
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
                >
                  {caseStatus.activeCases}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #b71c1c 0%, #c62828 100%)"
                    : "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <MoneyIcon
                    color="error"
                    sx={{ fontSize: { xs: 20, sm: 24 } }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Unpaid
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="error.main"
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  {formatCurrency(caseStatus.unpaidPenaltyAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  of {formatCurrency(caseStatus.totalPenaltyAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Personal Information */}
        <Accordion defaultExpanded sx={{ borderRadius: 2, mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Personal & Vehicle Information
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      Full Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {caseStatus.accusedName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      CNIC
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {caseStatus.cnic}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      Contact
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {caseStatus.contact || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      Address
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {[
                        caseStatus.address,
                        caseStatus.city,
                        caseStatus.province,
                      ]
                        .filter(Boolean)
                        .join(", ") || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      Vehicle
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {caseStatus.vehiclePlateNumber}
                      {caseStatus.vehicleMake && ` - ${caseStatus.vehicleMake}`}
                      {caseStatus.vehicleColor &&
                        ` (${caseStatus.vehicleColor})`}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Tabs for Detailed Records */}
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
            }}
          >
            <Tab
              icon={<ReceiptIcon />}
              label={`Challans (${caseStatus.challans.length})`}
              iconPosition="start"
              sx={{ textTransform: "none" }}
            />
            <Tab
              icon={<PoliceIcon />}
              label={`FIRs (${caseStatus.firs.length})`}
              iconPosition="start"
              sx={{ textTransform: "none" }}
            />
            <Tab
              icon={<GavelIcon />}
              label={`Cases (${caseStatus.cases.length})`}
              iconPosition="start"
              sx={{ textTransform: "none" }}
            />
          </Tabs>

          {/* Challans Tab */}
          {tabValue === 0 && (
            <Box p={2}>
              {caseStatus.challans.length === 0 ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  No challans found - Great record!
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Violation
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Station</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Issue Date
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Penalty
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {caseStatus.challans.map((challan) => (
                        <TableRow
                          key={challan.challanId}
                          hover
                          sx={{
                            bgcolor: challan.isOverdue ? "error.50" : "inherit",
                          }}
                        >
                          <TableCell>#{challan.challanId}</TableCell>
                          <TableCell>
                            <Box>
                              {challan.violationType}
                              {challan.isCognizable && (
                                <Chip
                                  size="small"
                                  label="Cognizable"
                                  color="error"
                                  sx={{
                                    ml: 1,
                                    height: 20,
                                    fontSize: "0.65rem",
                                  }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{challan.stationName}</TableCell>
                          <TableCell>
                            {formatDateTime(challan.issueDateTime)}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              {formatDate(challan.dueDateTime)}
                              {challan.isOverdue && (
                                <Chip
                                  size="small"
                                  label="Overdue"
                                  color="error"
                                  sx={{ height: 18, fontSize: "0.6rem" }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(challan.penaltyAmount)}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Chip
                                size="small"
                                label={challan.status}
                                color={getStatusColor(challan.status) as any}
                                sx={{ height: 22 }}
                              />
                              {challan.hasFir && (
                                <Chip
                                  size="small"
                                  label="FIR"
                                  color="warning"
                                  variant="outlined"
                                  sx={{ height: 18, fontSize: "0.6rem" }}
                                />
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* FIRs Tab */}
          {tabValue === 1 && (
            <Box p={2}>
              {caseStatus.firs.length === 0 ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  No FIRs found - Great record!
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>FIR No</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Date Filed
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Station</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Related Challan
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Case Filed
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {caseStatus.firs.map((fir) => (
                        <TableRow key={fir.firId} hover>
                          <TableCell>
                            <strong>{fir.firNo}</strong>
                          </TableCell>
                          <TableCell>{formatDate(fir.dateFiled)}</TableCell>
                          <TableCell>{fir.stationName}</TableCell>
                          <TableCell>#{fir.relatedChallanId}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={fir.status}
                              color={getStatusColor(fir.status) as any}
                            />
                          </TableCell>
                          <TableCell>
                            {fir.hasCase ? (
                              <Chip
                                size="small"
                                icon={<CheckCircleIcon />}
                                label="Yes"
                                color="success"
                              />
                            ) : (
                              <Chip
                                size="small"
                                label="No"
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Cases Tab */}
          {tabValue === 2 && (
            <Box p={2}>
              {caseStatus.cases.length === 0 ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  No court cases found - Great record!
                </Alert>
              ) : (
                <>
                  {caseStatus.cases.map((caseItem) => (
                    <Accordion
                      key={caseItem.caseId}
                      sx={{ mb: 1, borderRadius: 2, overflow: "hidden" }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={2}
                          width="100%"
                          pr={2}
                          flexWrap="wrap"
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {caseItem.caseNo}
                          </Typography>
                          <Chip
                            size="small"
                            label={caseItem.caseStatus}
                            color={getStatusColor(caseItem.caseStatus) as any}
                          />
                          {caseItem.hearingDate && (
                            <Chip
                              size="small"
                              icon={<ScheduleIcon />}
                              label={`Hearing: ${formatDate(
                                caseItem.hearingDate
                              )}`}
                              variant="outlined"
                              color="primary"
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Case Type
                            </Typography>
                            <Typography gutterBottom fontWeight={500}>
                              {caseItem.caseType}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Court
                            </Typography>
                            <Typography gutterBottom fontWeight={500}>
                              {caseItem.courtName}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Judge
                            </Typography>
                            <Typography gutterBottom fontWeight={500}>
                              {caseItem.judgeName}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Related FIR
                            </Typography>
                            <Typography gutterBottom fontWeight={500}>
                              {caseItem.firNo}
                            </Typography>

                            {caseItem.verdict && (
                              <>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Verdict
                                </Typography>
                                <Alert severity="info" sx={{ mt: 1 }}>
                                  {caseItem.verdict}
                                </Alert>
                              </>
                            )}
                          </Grid>

                          {/* Case Statements */}
                          {caseItem.statements.length > 0 && (
                            <Grid item xs={12}>
                              <Divider sx={{ my: 2 }} />
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <DescriptionIcon fontSize="small" />
                                Case Statements ({caseItem.statements.length})
                              </Typography>
                              {caseItem.statements.map((stmt) => (
                                <Paper
                                  key={stmt.statementId}
                                  variant="outlined"
                                  sx={{ p: 2, mt: 1, borderRadius: 2 }}
                                >
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={1}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                    >
                                      {stmt.statementBy}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {formatDate(stmt.statementDate)}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2">
                                    {stmt.statementText}
                                  </Typography>
                                </Paper>
                              ))}
                            </Grid>
                          )}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
        py: { xs: 2, sm: 4 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: { xs: 2, sm: 4 },
            borderRadius: 3,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/case-status")}
            >
              <BrandLogo size="large" />
              <Box>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                >
                  NoiseSentinel
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Public Case Status Portal
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {activeStep === 2 && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    textTransform: "none",
                    display: { xs: "none", sm: "flex" },
                  }}
                >
                  Logout
                </Button>
              )}
              <ThemeToggleButton />
            </Box>
          </Box>
        </Paper>

        {/* Stepper - Hide on step 3 for cleaner look */}
        {activeStep < 2 && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {/* Step Content */}
        {activeStep === 0 && renderStep1()}
        {activeStep === 1 && renderStep2()}
        {activeStep === 2 && renderStep3()}

        {/* Footer */}
        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            © {new Date().getFullYear()} NoiseSentinel. Your trusted traffic
            violation management system.
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            <Link
              component="button"
              onClick={handleNavigateToSearchChallans}
              color="primary"
              underline="hover"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.875rem",
              }}
            >
              <SearchIcon fontSize="small" /> Search Challans
            </Link>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Session expires after 24 hours
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicCaseStatusPage;
