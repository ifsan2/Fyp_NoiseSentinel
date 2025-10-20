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
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { Visibility, Gavel } from "@mui/icons-material";
import { JudgeDetailsDto } from "@/models/User";
import { useAuth } from "@/contexts/AuthContext"; // ✅ ADD

interface JudgeTableProps {
  judges: JudgeDetailsDto[];
  onView: (userId: number) => void;
  onEdit: (judgeId: number) => void;
  onDelete: (judgeId: number) => void;
}

export const JudgeTable: React.FC<JudgeTableProps> = ({
  judges,
  onView,
  onEdit,
  onDelete,
}) => {
  const { isAdmin } = useAuth(); // ✅ ADD

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "warning.main" }}>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Judge Info
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Contact
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Court Details
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Cases
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
          {judges.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No judges found
              </TableCell>
            </TableRow>
          ) : (
            judges.map((judge) => (
              <TableRow key={judge.judgeId} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {judge.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {judge.username}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      CNIC: {judge.cnic}
                    </Typography>
                    <br />
                    <Chip label={judge.rank} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{judge.email}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {judge.contactNo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      <Gavel
                        fontSize="small"
                        sx={{ verticalAlign: "middle", mr: 0.5 }}
                      />
                      {judge.courtName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {judge.courtType}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      📍 {judge.courtLocation}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${judge.totalCases} Cases`}
                    size="small"
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={judge.status}
                    size="small"
                    color={judge.isActive ? "success" : "default"}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onView(judge.userId)}
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
                          onClick={() => onEdit(judge.judgeId)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(judge.judgeId)}
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
