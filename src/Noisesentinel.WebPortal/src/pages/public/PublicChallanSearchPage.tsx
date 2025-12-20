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
  IconButton,
  InputAdornment,
  Link,
} from "@mui/material";
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AssignmentOutlined as CaseIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import challanApi from "@/api/challanApi";
import { ChallanDto } from "@/models/Challan";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

interface SearchFormData {
  plateNumber: string;
  cnic: string;
}

export const PublicChallanSearchPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [challans, setChallans] = useState<ChallanDto[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<SearchFormData>({
    defaultValues: {
      plateNumber: "",
      cnic: "",
    },
  });

  // Check for passed data from case-status page
  useEffect(() => {
    const storedData = sessionStorage.getItem("challan_search_data");
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        if (data.plateNumber && data.cnic) {
          // Set form values
          setValue("plateNumber", data.plateNumber);
          setValue("cnic", data.cnic);

          // Clear the stored data
          sessionStorage.removeItem("challan_search_data");

          // Auto-submit after a brief delay to allow form to update
          setTimeout(() => {
            handleAutoSearch(data.plateNumber, data.cnic);
          }, 100);
        }
      } catch (error) {
        console.error("Error parsing stored search data:", error);
        sessionStorage.removeItem("challan_search_data");
      }
    }
  }, [setValue]);

  // Auto search function for when data is passed from case-status
  const handleAutoSearch = async (plateNumber: string, cnic: string) => {
    try {
      setLoading(true);
      setHasSearched(false);

      const results = await challanApi.searchChallansByPlateAndCnic(
        plateNumber,
        cnic
      );

      setChallans(results);
      setHasSearched(true);

      if (results.length === 0) {
        enqueueSnackbar("No challans found for the provided details", {
          variant: "info",
        });
      } else {
        enqueueSnackbar(`Found ${results.length} challan(s)`, {
          variant: "success",
        });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to search challans",
        { variant: "error" }
      );
      setHasSearched(true);
      setChallans([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SearchFormData) => {
    try {
      setLoading(true);
      setHasSearched(false);

      const results = await challanApi.searchChallansByPlateAndCnic(
        data.plateNumber,
        data.cnic
      );

      setChallans(results);
      setHasSearched(true);

      if (results.length === 0) {
        enqueueSnackbar("No challans found for the provided details", {
          variant: "info",
        });
      } else {
        enqueueSnackbar(`Found ${results.length} challan(s)`, {
          variant: "success",
        });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to search challans",
        { variant: "error" }
      );
      setHasSearched(true);
      setChallans([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (challan?: ChallanDto) => {
    if (challan) {
      // Print single challan
      printChallan(challan);
    } else {
      // Print all challans
      printAllChallans();
    }
  };

  const printChallan = (challan: ChallanDto) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      enqueueSnackbar("Please allow popups to print", { variant: "warning" });
      return;
    }

    const html = generateChallanPrintHTML(challan);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const printAllChallans = () => {
    if (challans.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      enqueueSnackbar("Please allow popups to print", { variant: "warning" });
      return;
    }

    const html = generateAllChallansPrintHTML(challans);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const generateChallanPrintHTML = (challan: ChallanDto) => {
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Challan #${challan.challanId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11px;
              line-height: 1.4;
              color: #000;
            }
            .challan-page {
              width: 210mm;
              margin: 0 auto;
              padding: 15px;
              background: white;
            }
            
            /* Header Section */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .logo {
              font-size: 40px;
            }
            .header-center {
              text-align: center;
              flex: 1;
            }
            .header-center h1 {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 2px;
              text-decoration: underline;
            }
            .header-center p {
              font-size: 14px;
              font-weight: bold;
            }
            
            /* Top Info Section */
            .top-info {
              display: grid;
              grid-template-columns: 1fr auto 1fr;
              gap: 10px;
              margin-bottom: 15px;
              border: 2px solid #000;
              padding: 10px;
            }
            .info-box {
              border: 1px solid #000;
              padding: 5px;
            }
            .info-label {
              font-weight: bold;
              font-size: 10px;
            }
            .info-value {
              font-size: 11px;
              margin-top: 2px;
            }
            .barcode-section {
              text-align: center;
              padding: 5px;
            }
            .barcode-placeholder {
              height: 40px;
              background: repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 4px);
              margin: 5px 0;
            }
            
            /* Main Details Table */
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
              border: 2px solid #000;
            }
            .details-table td {
              border: 1px solid #000;
              padding: 5px;
            }
            .label-cell {
              font-weight: bold;
              background: #f0f0f0;
              width: 25%;
              font-size: 10px;
            }
            .value-cell {
              width: 25%;
              font-size: 11px;
            }
            
            /* Violation Info Box */
            .violation-box {
              border: 2px solid #000;
              padding: 10px;
              margin-bottom: 10px;
              background: #f9f9f9;
            }
            .violation-box h3 {
              font-size: 12px;
              margin-bottom: 8px;
              text-align: center;
              text-decoration: underline;
            }
            .violation-details {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }
            
            /* Penalty Section */
            .penalty-section {
              border: 3px solid #000;
              padding: 8px;
              text-align: center;
              margin-bottom: 10px;
              background: #fff;
            }
            .penalty-label {
              font-size: 10px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .penalty-amount {
              font-size: 18px;
              font-weight: bold;
              color: #000;
            }
            
            /* Notes Section */
            .notes-section {
              border: 1px solid #000;
              padding: 8px;
              margin-bottom: 10px;
              font-size: 9px;
              background: #fffacd;
            }
            .notes-section p {
              margin-bottom: 4px;
            }
            
            /* Evidence Section */
            .evidence-section {
              border: 2px solid #000;
              padding: 10px;
              margin-bottom: 10px;
            }
            .evidence-section h3 {
              font-size: 11px;
              margin-bottom: 8px;
              font-weight: bold;
            }
            .evidence-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            .evidence-item {
              border: 1px solid #000;
              padding: 5px;
            }
            
            /* Emission Report Section */
            .emission-section {
              border: 2px solid #000;
              padding: 10px;
              margin-bottom: 10px;
              background: #e8f4f8;
            }
            .emission-section h3 {
              font-size: 11px;
              margin-bottom: 8px;
              font-weight: bold;
              text-decoration: underline;
            }
            
            /* Officer Section */
            .officer-section {
              border: 2px solid #000;
              padding: 8px;
              margin-bottom: 10px;
            }
            .officer-section h3 {
              font-size: 11px;
              margin-bottom: 6px;
              font-weight: bold;
            }
            
            /* Footer */
            .footer {
              border-top: 2px solid #000;
              padding-top: 8px;
              font-size: 9px;
              text-align: center;
            }
            
            /* Print Specific */
            @media print {
              body { padding: 0; }
              .challan-page { 
                width: 100%; 
                padding: 10px;
              }
            }
            
            /* Treasury Copy Section */
            .copy-section {
              page-break-before: always;
              border: 2px dashed #000;
              padding: 10px;
              margin-top: 20px;
            }
            .copy-header {
              text-align: center;
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 10px;
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="challan-page">
            
            <!-- Header -->
            <div class="header">
              <div class="header-left">
                <div class="logo">🛡️</div>
              </div>
              <div class="header-center">
                <h1>Noise Sentinel</h1>
                <p>Electronic Traffic Violation Ticket</p>
              </div>
              <div class="header-left">
                <div class="logo">🛡️</div>
              </div>
            </div>
            
            <!-- Top Info Section -->
            <div class="top-info">
              <div>
                <div class="info-box">
                  <div class="info-label">Ticket No:</div>
                  <div class="info-value"><strong>${
                    challan.challanId
                  }</strong></div>
                </div>
                <div class="info-box" style="margin-top: 5px;">
                  <div class="info-label">Registration No:</div>
                  <div class="info-value">${
                    challan.vehiclePlateNumber || challan.plateNumber || "N/A"
                  }</div>
                </div>
                <div class="info-box" style="margin-top: 5px;">
                  <div class="info-label">Violation Type:</div>
                  <div class="info-value">${
                    challan.violationType || "N/A"
                  }</div>
                </div>
                <div class="info-box" style="margin-top: 5px;">
                  <div class="info-label">Fine Amount:</div>
                  <div class="info-value"><strong>${
                    challan.penaltyAmount || "N/A"
                  }</strong></div>
                </div>
              </div>
              
              <div class="barcode-section">
                <div class="barcode-placeholder"></div>
                <div style="font-weight: bold;">${challan.challanId}</div>
              </div>
              
              <div>
                <div class="info-box">
                  <div class="info-label">Due Date:</div>
                  <div class="info-value"><strong>${formatDate(
                    challan.dueDateTime
                  )}</strong></div>
                </div>
                <div class="info-box" style="margin-top: 5px;">
                  <div class="info-label">Payment within due date:</div>
                  <div class="info-value">${
                    challan.penaltyAmount || "N/A"
                  }/-</div>
                </div>
                <div class="info-box" style="margin-top: 5px;">
                  <div class="info-label">Extended due date:</div>
                  <div class="info-value">${formatDate(
                    challan.dueDateTime
                  )}</div>
                </div>
              </div>
            </div>
            
            <!-- Accused Info -->
            <table class="details-table">
              <tr>
                <td class="label-cell">Name</td>
                <td class="value-cell" colspan="2"><strong>${
                  challan.accusedName || "N/A"
                }</strong></td>
                <td class="label-cell">CNIC</td>
                <td class="value-cell">${challan.accusedCnic || "N/A"}</td>
              </tr>
              <tr>
                <td class="label-cell">Father Name</td>
                <td class="value-cell" colspan="4">-</td>
              </tr>
              <tr>
                <td class="label-cell">Address</td>
                <td class="value-cell" colspan="2">${
                  challan.accusedAddress || challan.accusedCity || "N/A"
                }${
      challan.accusedCity && challan.accusedProvince
        ? `, ${challan.accusedProvince}`
        : ""
    }</td>
                <td class="label-cell">Contact</td>
                <td class="value-cell">${challan.accusedContact || "N/A"}</td>
              </tr>
            </table>
            
            <!-- Vehicle Details -->
            <table class="details-table">
              <tr>
                <td class="label-cell">Veh Make Year</td>
                <td class="value-cell">${
                  challan.vehicleMakeYear
                    ? new Date(challan.vehicleMakeYear).getFullYear()
                    : "N/A"
                }</td>
                <td class="label-cell">Make</td>
                <td class="value-cell">${challan.vehicleMake || "N/A"}</td>
              </tr>
              <tr>
                <td class="label-cell">Color</td>
                <td class="value-cell">${challan.vehicleColor || "N/A"}</td>
                <td class="label-cell">Chassis No.</td>
                <td class="value-cell">-</td>
              </tr>
              <tr>
                <td class="label-cell">Engine No.</td>
                <td class="value-cell" colspan="3">-</td>
              </tr>
            </table>
            
            <!-- Violation Box -->
            <div class="violation-box">
              <h3>NOISE SENTINEL E-TICKETING CENTER</h3>
              <div class="violation-details">
                <div>
                  <div class="info-label">Affirmed By ID:</div>
                  <div class="info-value">${challan.officerId || "N/A"}</div>
                </div>
                <div>
                  <div class="info-label">Paid Challans:</div>
                  <div class="info-value">-</div>
                </div>
                <div>
                  <div class="info-label">Unpaid Challans:</div>
                  <div class="info-value">${
                    challan.status === "Unpaid" ? "1" : "0"
                  }</div>
                </div>
                <div>
                  <div class="info-label">Issue Date:</div>
                  <div class="info-value"><strong>${formatDate(
                    challan.issueDateTime
                  )}</strong></div>
                </div>
                <div>
                  <div class="info-label">Penalty Points:</div>
                  <div class="info-value">${
                    challan.isCognizable ? "20" : "0"
                  } out of 20</div>
                </div>
              </div>
              ${
                challan.officerName
                  ? `
              <div style="margin-top: 8px; text-align: right;">
                <div class="info-label">Issuing Officer:</div>
                <div class="info-value"><strong>${challan.officerName}</strong></div>
              </div>
              `
                  : ""
              }
            </div>
            
            ${
              challan.emissionReportId
                ? `
            <!-- Emission Report Section -->
            <div class="emission-section">
              <h3>EMISSION TEST REPORT</h3>
              <table style="width: 100%; margin-top: 5px;">
                <tr>
                  <td class="label-cell">Device Name:</td>
                  <td class="value-cell">${challan.deviceName || "N/A"}</td>
                  <td class="label-cell">Sound Level (dBA):</td>
                  <td class="value-cell"><strong>${
                    challan.soundLevelDBa || "N/A"
                  }</strong></td>
                </tr>
                <tr>
                  <td class="label-cell">Classification:</td>
                  <td class="value-cell">${
                    challan.mlClassification || "N/A"
                  }</td>
                  <td class="label-cell">Test Date:</td>
                  <td class="value-cell">${
                    challan.emissionTestDateTime
                      ? formatDate(challan.emissionTestDateTime)
                      : "N/A"
                  }</td>
                </tr>
              </table>
            </div>
            `
                : ""
            }
            
            ${
              challan.evidencePath
                ? `
            <!-- Evidence Photo Section -->
            <div class="evidence-section">
              <h3>EVIDENCE PHOTO</h3>
              <div style="text-align: center; margin-top: 10px; max-height: 200px; overflow: hidden;">
                <img 
                  src="${challan.evidencePath}" 
                  alt="Evidence Photo" 
                  style="max-width: 400px; max-height: 180px; height: auto; width: auto; border: 2px solid #000; border-radius: 4px; object-fit: contain; background: #f9f9f9;"
                  onerror="this.style.display='none'; this.parentElement.innerHTML='<p style=\\'color: #666;\\'>Evidence photo not available</p>';"
                />
              </div>
            </div>
            `
                : ""
            }
            
            <!-- Penalty Amount -->
            <div class="penalty-section">
              <div class="penalty-label">PENALTY AMOUNT</div>
              <div class="penalty-amount">Rs. ${
                challan.penaltyAmount?.toLocaleString() || "N/A"
              }/-</div>
            </div>
            
            <!-- Notes -->
            <div class="notes-section">
              <p><strong>INSTRUCTIONS:</strong></p>
              <p>• You have been fined under Section 1 IB-A of motors ordinance 1965. Please pay the mentioned fine on or before the due date of issuance of this notice, failing which your vehicle can be impounded till payment of outstanding fine.</p>
              <p>• Verification Process: ${
                challan.bankDetails ||
                "Contact issuing station for payment details"
              }</p>
              ${
                challan.isCognizable
                  ? "<p><strong>⚠ This is a COGNIZABLE offense.</strong></p>"
                  : ""
              }
            </div>
            
            <!-- Officer Details -->
            <div class="officer-section">
              <h3>Issued By:</h3>
              <table style="width: 100%;">
                <tr>
                  <td class="label-cell">Officer Name:</td>
                  <td class="value-cell">${challan.officerName || "N/A"}</td>
                  <td class="label-cell">Badge Number:</td>
                  <td class="value-cell">${
                    challan.officerBadgeNumber || challan.badgeNumber || "N/A"
                  }</td>
                </tr>
                <tr>
                  <td class="label-cell">Police Station:</td>
                  <td class="value-cell" colspan="3">${
                    challan.stationName || "N/A"
                  }</td>
                </tr>
              </table>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p>This is an official traffic violation challan issued by Noise Sentinel.</p>
              <p>For queries, please contact the issuing police station.</p>
              <p>Printed on: ${new Date().toLocaleString("en-GB")}</p>
            </div>
            
            <!-- Treasury Copy -->
            <div class="copy-section">
              <div class="copy-header">TREASURY COPY</div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;"><strong>Ticket No:</strong></td>
                  <td style="border: 1px solid #000; padding: 5px;">${
                    challan.challanId
                  }</td>
                  <td style="border: 1px solid #000; padding: 5px; text-align: center;" rowspan="4">
                    <div class="barcode-placeholder" style="width: 100px; height: 60px; margin: 0 auto;"></div>
                    <div><strong>${challan.challanId}</strong></div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;"><strong>Name:</strong></td>
                  <td style="border: 1px solid #000; padding: 5px;">${
                    challan.accusedName || "N/A"
                  }</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;"><strong>Address:</strong></td>
                  <td style="border: 1px solid #000; padding: 5px;">${
                    challan.accusedAddress || challan.accusedCity || "N/A"
                  }${
      challan.accusedCity && challan.accusedProvince
        ? `, ${challan.accusedProvince}`
        : ""
    }</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;"><strong>Contact:</strong></td>
                  <td style="border: 1px solid #000; padding: 5px;">${
                    challan.accusedContact || "N/A"
                  }</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;"><strong>Amount:</strong></td>
                  <td style="border: 1px solid #000; padding: 5px;"><strong>Rs. ${
                    challan.penaltyAmount || "N/A"
                  }/-</strong></td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;"><strong>Due Date:</strong></td>
                  <td style="border: 1px solid #000; padding: 5px;" colspan="2">${formatDate(
                    challan.dueDateTime
                  )}</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;"><strong>Traffic Violation Type:</strong></td>
                  <td style="border: 1px solid #000; padding: 5px;" colspan="2">${
                    challan.violationType || "N/A"
                  }</td>
                </tr>
              </table>
              <div style="margin-top: 10px; text-align: center; font-size: 9px;">
                <p><strong>Official Stamp of Branch</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Signature</strong></p>
              </div>
            </div>
            
            <!-- Post Office Copy -->
            <div class="copy-section">
              <div class="copy-header">FOR POST OFFICE USE ONLY</div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;"><strong>Ticket No:</strong></td>
                  <td style="border: 1px solid #000; padding: 5px;">${
                    challan.challanId
                  }</td>
                  <td style="border: 1px solid #000; padding: 5px; text-align: center;" rowspan="3">
                    <div class="barcode-placeholder" style="width: 100px; height: 50px; margin: 0 auto;"></div>
                    <div><strong>${challan.challanId}</strong></div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;"><strong>Name:</strong></td>
                  <td style="border: 1px solid #000; padding: 5px;">${
                    challan.accusedName || "N/A"
                  }</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;"><strong>Address:</strong></td>
                  <td style="border: 1px solid #000; padding: 5px;">${
                    challan.accusedAddress || challan.accusedCity || "N/A"
                  }</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;"><strong>Contact:</strong></td>
                  <td style="border: 1px solid #000; padding: 5px;">${
                    challan.accusedContact || "N/A"
                  }</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;"><strong>REG No:</strong></td>
                  <td style="border: 1px solid #000; padding: 5px;" colspan="2">${
                    challan.vehiclePlateNumber || challan.plateNumber || "N/A"
                  }</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;" colspan="3" style="text-align: right; padding-right: 20px;">
                    <strong>Receiver Name: _______________</strong>
                  </td>
                </tr>
              </table>
            </div>
            
          </div>
        </body>
      </html>
    `;
  };

  const generateAllChallansPrintHTML = (challans: ChallanDto[]) => {
    const challanHTMLs = challans
      .map((challan, index) => {
        const singleHTML = generateChallanPrintHTML(challan);
        const bodyContent =
          singleHTML.match(/<body>[\s\S]*<\/body>/)?.[0] || "";
        return `
            ${index > 0 ? '<div style="page-break-before: always;"></div>' : ""}
            ${bodyContent.replace(/<\/?body>/g, "")}
          `;
      })
      .join("");

    const firstChallanHTML = generateChallanPrintHTML(challans[0]);
    const styleContent =
      firstChallanHTML.match(/<style>[\s\S]*<\/style>/)?.[0] || "";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>All Challans</title>
          ${styleContent}
        </head>
        <body>
          ${challanHTMLs}
        </body>
      </html>
    `;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "success";
      case "unpaid":
        return "error";
      case "disputed":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)"
            : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: { xs: 3, sm: 6 },
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
              onClick={() => navigate("/search-challans")}
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
                  Public Challan Search
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CaseIcon />}
                onClick={() => navigate("/case-status")}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Case Status
              </Button>
              <ThemeToggleButton />
            </Box>
          </Box>
        </Paper>

        {/* Title Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 4,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)"
                : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            color: "white",
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <ReceiptIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ fontSize: { xs: "1.5rem", sm: "2.5rem" } }}
            >
              Search Your Challans
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Enter your vehicle plate number and CNIC to view and print your
            traffic violation challans
          </Typography>
        </Paper>

        {/* Search Form */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background:
              theme.palette.mode === "dark"
                ? theme.palette.background.paper
                : "white",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Controller
                  name="plateNumber"
                  control={control}
                  rules={{
                    required: "Vehicle plate number is required",
                    maxLength: {
                      value: 50,
                      message: "Plate number cannot exceed 50 characters",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Vehicle Plate Number"
                      placeholder="e.g., PK-ABC-123"
                      error={!!errors.plateNumber}
                      helperText={errors.plateNumber?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CarIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={5}>
                <Controller
                  name="cnic"
                  control={control}
                  rules={{
                    required: "CNIC is required",
                    pattern: {
                      value: /^\d{5}-\d{7}-\d{1}$/,
                      message: "CNIC must be in format: 12345-1234567-1",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="CNIC"
                      placeholder="12345-1234567-1"
                      error={!!errors.cnic}
                      helperText={errors.cnic?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={<SearchIcon />}
                  sx={{
                    height: "56px",
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Results Section */}
        {hasSearched && (
          <>
            {challans.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  No Challans Found
                </Typography>
                <Typography>
                  No traffic violation challans were found for the provided
                  vehicle plate number and CNIC. Please verify your information
                  and try again.
                </Typography>
              </Alert>
            ) : (
              <>
                {/* Results Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h5" fontWeight={600}>
                    Found {challans.length} Challan
                    {challans.length > 1 ? "s" : ""}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={() => handlePrint()}
                    sx={{ fontWeight: 600 }}
                  >
                    Print All
                  </Button>
                </Box>

                {/* Challans List */}
                <Grid container spacing={3}>
                  {challans.map((challan) => (
                    <Grid item xs={12} key={challan.challanId}>
                      <Card
                        elevation={2}
                        sx={{
                          borderRadius: 3,
                          border: `1px solid ${theme.palette.divider}`,
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: theme.shadows[8],
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          {/* Challan Header */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 3,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                color="primary"
                                gutterBottom
                              >
                                Challan #{challan.challanId}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Chip
                                  label={challan.status}
                                  color={getStatusColor(challan.status)}
                                  size="small"
                                />
                                {challan.isOverdue && (
                                  <Chip
                                    label="Overdue"
                                    color="error"
                                    size="small"
                                    icon={<WarningIcon />}
                                  />
                                )}
                                {challan.hasFir && (
                                  <Chip
                                    label="FIR Filed"
                                    color="warning"
                                    size="small"
                                  />
                                )}
                                {challan.isCognizable && (
                                  <Chip
                                    label="Cognizable"
                                    color="error"
                                    size="small"
                                  />
                                )}
                              </Box>
                            </Box>
                            <IconButton
                              color="primary"
                              onClick={() => handlePrint(challan)}
                              sx={{
                                bgcolor: theme.palette.action.hover,
                                "&:hover": {
                                  bgcolor: theme.palette.action.selected,
                                },
                              }}
                            >
                              <PrintIcon />
                            </IconButton>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          {/* Challan Details Grid */}
                          <Grid container spacing={3}>
                            {/* Violation Details */}
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                              >
                                Violation Details
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Type
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {challan.violationType || "N/A"}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Penalty Amount
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    color="error"
                                  >
                                    Rs.{" "}
                                    {challan.penaltyAmount?.toLocaleString() ||
                                      "N/A"}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>

                            {/* Dates */}
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                              >
                                Important Dates
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <CalendarIcon
                                    fontSize="small"
                                    color="action"
                                  />
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Issue Date
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {formatDate(challan.issueDateTime)}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <CalendarIcon
                                    fontSize="small"
                                    color="action"
                                  />
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Due Date
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {formatDate(challan.dueDateTime)}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </Grid>

                            {/* Vehicle Info */}
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                              >
                                Vehicle Information
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Plate Number
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {challan.vehiclePlateNumber ||
                                      challan.plateNumber ||
                                      "N/A"}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Make
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {challan.vehicleMake || "N/A"}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Make Year
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {challan.vehicleMakeYear
                                      ? new Date(
                                          challan.vehicleMakeYear
                                        ).getFullYear()
                                      : "N/A"}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Color
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {challan.vehicleColor || "N/A"}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>

                            {/* Accused Info */}
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                              >
                                Accused Information
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Name
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {challan.accusedName || "N/A"}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    CNIC
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {challan.accusedCnic || "N/A"}
                                  </Typography>
                                </Box>
                                {challan.accusedContact && (
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Contact
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {challan.accusedContact}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Grid>

                            {/* Emission Report Details */}
                            {challan.emissionReportId && (
                              <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                  gutterBottom
                                  sx={{ fontWeight: 600 }}
                                >
                                  Emission Test Report
                                </Typography>
                                <Box
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                      xs: "1fr",
                                      sm: "repeat(2, 1fr)",
                                      md: "repeat(4, 1fr)",
                                    },
                                    gap: 2,
                                    p: 2,
                                    bgcolor:
                                      theme.palette.mode === "dark"
                                        ? "rgba(14, 165, 233, 0.1)"
                                        : "rgba(14, 165, 233, 0.05)",
                                    borderRadius: 2,
                                    border: `1px solid ${theme.palette.divider}`,
                                  }}
                                >
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Device Name
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {challan.deviceName || "N/A"}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Sound Level (dBA)
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={700}
                                      color="error"
                                    >
                                      {challan.soundLevelDBa || "N/A"}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Classification
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {challan.mlClassification || "N/A"}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Test Date
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {challan.emissionTestDateTime
                                        ? formatDate(
                                            challan.emissionTestDateTime
                                          )
                                        : "N/A"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                            )}

                            {/* Evidence Image */}
                            {challan.evidencePath && (
                              <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                  gutterBottom
                                  sx={{ fontWeight: 600 }}
                                >
                                  Evidence Photo
                                </Typography>
                                <Box
                                  sx={{
                                    position: "relative",
                                    width: "100%",
                                    maxWidth: 400,
                                    mx: "auto",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    border: `2px solid ${theme.palette.divider}`,
                                  }}
                                >
                                  <Box
                                    component="img"
                                    src={challan.evidencePath}
                                    alt={`Evidence for Challan #${challan.challanId}`}
                                    sx={{
                                      width: "100%",
                                      maxHeight: 250,
                                      height: "auto",
                                      objectFit: "contain",
                                      display: "block",
                                      bgcolor: "#f5f5f5",
                                    }}
                                    onError={(
                                      e: React.SyntheticEvent<HTMLImageElement>
                                    ) => {
                                      const target = e.currentTarget;
                                      target.style.display = "none";
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = `
                                          <div style="padding: 40px; text-align: center; background: ${theme.palette.action.hover};">
                                            <p style="color: ${theme.palette.text.secondary};">Evidence image not available</p>
                                          </div>
                                        `;
                                      }
                                    }}
                                  />
                                </Box>
                              </Grid>
                            )}

                            {/* Officer & Station */}
                            <Grid item xs={12}>
                              <Divider sx={{ my: 1 }} />
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                              >
                                Issued By
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 3,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Officer
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {challan.officerName || "N/A"}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Badge Number
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {challan.officerBadgeNumber ||
                                      challan.badgeNumber ||
                                      "N/A"}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Station
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {challan.stationName || "N/A"}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>

                            {/* Bank Details */}
                            {challan.bankDetails && (
                              <Grid item xs={12}>
                                <Alert severity="info" icon={<MoneyIcon />}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Payment Details
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {challan.bankDetails}
                                  </Typography>
                                </Alert>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </>
        )}

        {/* Footer */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            © {new Date().getFullYear()} NoiseSentinel. Your trusted traffic
            violation management system.
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            <Link
              component="button"
              onClick={() => navigate("/case-status")}
              color="primary"
              underline="hover"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.875rem",
              }}
            >
              <CaseIcon fontSize="small" /> Check Case Status
            </Link>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography variant="caption" color="text.secondary">
              For queries, contact your local police station
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
