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
import {
  Edit,
  Delete,
  Visibility,
  SwapHoriz,
  LocalPolice,
  CheckCircle,
} from "@mui/icons-material";
import { PoliceOfficerDetailsDto } from "@/models/User";

interface OfficerTableProps {
  officers: PoliceOfficerDetailsDto[];
  onView: (userId: number) => void;
  onEdit: (officerId: number) => void;
  onTransfer: (officerId: number) => void;
  onDelete: (officerId: number) => void;
  onToggleStatus?: (officerId: number, currentStatus: boolean) => void;
  showActions?: boolean;
}

export const OfficerTable: React.FC<OfficerTableProps> = ({
  officers,
  onView,
  onEdit,
  onTransfer,
  onDelete,
  onToggleStatus,
  showActions = true,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "info.main" }}>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Officer Info
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Station
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Contact
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>Rank</TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Challans
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Status
            </TableCell>
            {showActions && (
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {officers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 7 : 6} align="center">
                No officers found
              </TableCell>
            </TableRow>
          ) : (
            officers.map((officer) => (
              <TableRow key={officer.officerId} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      <LocalPolice
                        fontSize="small"
                        sx={{ verticalAlign: "middle", mr: 0.5 }}
                      />
                      {officer.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {officer.username} • Badge: {officer.badgeNumber}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      CNIC: {officer.cnic}
                    </Typography>
                    {officer.isInvestigationOfficer && (
                      <Chip
                        label="IO"
                        size="small"
                        color="warning"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {officer.stationName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {officer.stationCode}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{officer.email}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {officer.contactNo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={officer.rank} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={officer.totalChallans || 0}
                    size="small"
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={officer.isActive ? "Active" : "Inactive"}
                    size="small"
                    color={officer.isActive ? "success" : "default"}
                  />
                </TableCell>
                {showActions && (
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

                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(officer.officerId)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Transfer Station">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => onTransfer(officer.officerId)}
                      >
                        <SwapHoriz fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {!officer.isActive && onToggleStatus ? (
                      <Tooltip title="Activate Officer">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() =>
                            onToggleStatus(officer.officerId, officer.isActive)
                          }
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(officer.officerId)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
