import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import { Visibility, Assignment, Warning } from "@mui/icons-material";
import { ChallanDto } from "@/models/Challan";

interface ChallanTableProps {
  challans: ChallanDto[];
  onView: (challanId: number) => void;
}

export const ChallanTable: React.FC<ChallanTableProps> = ({
  challans,
  onView,
}) => {
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
        return "warning";
      case "overdue":
        return "error";
      case "disputed":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "primary.main" }}>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Challan #
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Accused/Vehicle
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Violation
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Officer/Station
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Penalty
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Dates
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Status
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {challans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No challans found
              </TableCell>
            </TableRow>
          ) : (
            challans.map((challan) => (
              <TableRow key={challan.challanId} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Assignment color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight={600}>
                      #{challan.challanId}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {challan.accusedName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      CNIC: {challan.accusedCnic}
                    </Typography>
                    <br />
                    <Chip
                      label={challan.vehiclePlateNumber || challan.plateNumber}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {challan.violationType}
                    </Typography>
                    {challan.isCognizable && (
                      <Chip
                        label="Cognizable"
                        size="small"
                        color="error"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {challan.officerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {challan.badgeNumber}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {challan.stationName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color="error.main"
                  >
                    PKR {challan.penaltyAmount?.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="caption" display="block">
                      Issued: {formatDate(challan.issueDateTime)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Due: {formatDate(challan.dueDateTime)}
                    </Typography>
                    {(challan.daysOverdue || 0) > 0 && (
                      <Chip
                        label={`${challan.daysOverdue} days overdue`}
                        size="small"
                        color="error"
                        icon={<Warning />}
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip
                      label={challan.status}
                      size="small"
                      color={getStatusColor(challan.status) as any}
                    />
                    {challan.hasFir && (
                      <Chip
                        label="Has FIR"
                        size="small"
                        color="warning"
                        sx={{ mt: 0.5, display: "block", width: "fit-content" }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onView(challan.challanId)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
