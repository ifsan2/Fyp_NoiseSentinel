/**
 * Export Helper Functions for Station Authority
 */
export const stationExport = {
  /**
   * Export data to CSV
   */
  exportToCSV(data: any[], filename: string) {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
      headers.join(","), // Header row
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape commas and quotes
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || "";
          })
          .join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export stations to CSV
   */
  exportStations(stations: any[]) {
    const data = stations.map((s) => ({
      "Station ID": s.stationId,
      "Station Name": s.stationName,
      "Station Code": s.stationCode,
      Location: s.location || "",
      District: s.district || "",
      Province: s.province || "",
      Contact: s.contact || "",
      Officers: s.totalOfficers || 0,
      Challans: s.totalChallans || 0,
      FIRs: s.totalFirs || 0,
    }));

    this.exportToCSV(data, "police_stations");
  },

  /**
   * Export officers to CSV
   */
  exportOfficers(officers: any[]) {
    const data = officers.map((o) => ({
      "Officer ID": o.officerId,
      "Full Name": o.fullName,
      "Badge Number": o.badgeNumber,
      Rank: o.rank,
      CNIC: o.cnic,
      "Contact Number": o.contactNo,
      "Station Name": o.stationName,
      "Station Code": o.stationCode,
      "Investigation Officer": o.isInvestigationOfficer ? "Yes" : "No",
      Status: o.isActive ? "Active" : "Inactive",
      "Total Challans": o.totalChallans || 0,
    }));

    this.exportToCSV(data, "police_officers");
  },

  /**
   * Export challans to CSV
   */
  exportChallans(challans: any[]) {
    const data = challans.map((c) => ({
      "Challan ID": c.challanId,
      "Accused Name": c.accusedName || "",
      "Accused CNIC": c.accusedCnic || "",
      "Vehicle Plate": c.plateNumber || "",
      Violation: c.violationType || "",
      "Penalty Amount": c.penaltyAmount || 0,
      "Issue Date": new Date(c.issueDateTime).toLocaleDateString(),
      "Due Date": new Date(c.dueDateTime).toLocaleDateString(),
      Status: c.status,
      "Has FIR": c.hasFir ? "Yes" : "No",
      "Station Name": c.stationName || "",
      "Officer Name": c.officerName || "",
      "Days Overdue": c.daysOverdue || 0,
    }));

    this.exportToCSV(data, "challans");
  },

  /**
   * Export FIRs to CSV
   */
  exportFirs(firs: any[]) {
    const data = firs.map((f) => ({
      "FIR Number": f.firNumber,
      "Accused Name": f.accusedName || "",
      "Accused CNIC": f.accusedCnic || "",
      "Vehicle Plate": f.vehiclePlate || "",
      Violation: f.violationType || "",
      "Filed Date": new Date(f.filedDate).toLocaleDateString(),
      Status: f.status,
      "Station Name": f.stationName,
      "Informant Name": f.informantName || "",
      "Has Case": f.hasCase ? "Yes" : "No",
      "Case Number": f.caseNumber || "",
    }));

    this.exportToCSV(data, "firs");
  },

  /**
   * Export devices to CSV
   */
  exportDevices(devices: any[]) {
    const data = devices.map((d) => ({
      "Device ID": d.deviceId,
      "Device Name": d.deviceName,
      "Firmware Version": d.firmwareVersion,
      "Calibration Date": new Date(d.calibrationDate).toLocaleDateString(),
      Calibrated: d.calibrationStatus ? "Yes" : "No",
      "Certificate No": d.calibrationCertificateNo || "",
      "Station Name": d.stationName || "",
      Paired: d.isPaired ? "Yes" : "No",
      "Paired Officer": d.pairedOfficerName || "",
      Status: d.isActive ? "Active" : "Inactive",
    }));

    this.exportToCSV(data, "iot_devices");
  },
};
