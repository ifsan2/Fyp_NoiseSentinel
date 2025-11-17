import React, { useState } from "react";
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
  Box,
  Typography,
  Chip,
  TablePagination,
  Switch,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { Visibility, LocalPolice } from "@mui/icons-material";
import { PoliceOfficerDetailsDto } from "@/models/User";
import { useAuth } from "@/contexts/AuthContext";

interface OfficerTableProps {
  officers: PoliceOfficerDetailsDto[];
  onView: (userId: number) => void;
  onEdit: (officerId: number) => void;
  onDelete: (officerId: number) => void;
  onToggleStatus: (officerId: number, currentStatus: boolean) => void;
}

export const OfficerTable: React.FC<OfficerTableProps> = ({
  officers,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const { isAdmin } = useAuth();

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "info.main" }}>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Officer Info
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Contact
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Station Details
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Challans
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
          {officers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No police officers found
              </TableCell>
            </TableRow>
          ) : (
            officers.map((officer) => (
              <TableRow key={officer.officerId} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {officer.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {officer.username}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      CNIC: {officer.cnic}
                    </Typography>
                    <br />
                    <Chip
                      label={officer.rank}
                      size="small"
                      sx={{ mt: 0.5, mr: 0.5 }}
                    />
                    <Chip
                      label={`Badge: ${officer.badgeNumber}`}
                      size="small"
                      color="primary"
                      sx={{ mt: 0.5 }}
                    />
                    {officer.isInvestigationOfficer && (
                      <Chip
                        label="IO"
                        size="small"
                        color="warning"
                        sx={{ mt: 0.5, ml: 0.5 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{officer.email}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {officer.contactNo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      <LocalPolice
                        fontSize="small"
                        sx={{ verticalAlign: "middle", mr: 0.5 }}
                      />
                      {officer.stationName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Code: {officer.stationCode}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      📍 {officer.stationLocation}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${officer.totalChallans} Challans`}
                    size="small"
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={officer.status}
                    size="small"
                    color={officer.isActive ? "success" : "default"}
                  />
                  <br />
                  <Tooltip
                    title={
                      officer.isActive
                        ? "Deactivate Officer"
                        : "Activate Officer"
                    }
                  >
                    <Switch
                      checked={officer.isActive}
                      onChange={() =>
                        onToggleStatus(officer.officerId, officer.isActive)
                      }
                      size="small"
                      color="success"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onView(officer.userId)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* ✅ HIDE Edit/Delete for Admin */}
                  {!isAdmin && (
                    <>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEdit(officer.officerId)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(officer.officerId)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
