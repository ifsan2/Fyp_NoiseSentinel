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
import { Edit, Delete, Gavel } from "@mui/icons-material";
import { ViolationDto } from "@/models/Violation";

interface ViolationTableProps {
  violations: ViolationDto[];
  onEdit: (violationId: number) => void;
  onDelete: (violationId: number, violationType?: string) => void;
}

export const ViolationTable: React.FC<ViolationTableProps> = ({
  violations,
  onEdit,
  onDelete,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "warning.main" }}>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Violation Name
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Description
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Penalty
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Section of Law
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>Type</TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {violations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No violations found
              </TableCell>
            </TableRow>
          ) : (
            violations.map((violation) => (
              <TableRow key={violation.violationId} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Gavel color="warning" />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {violation.violationType}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {violation.violationId}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                    {violation.description || "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color="error.main"
                  >
                    PKR {violation.penaltyAmount.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  {violation.sectionOfLaw ? (
                    <Typography variant="body2">
                      {violation.sectionOfLaw}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      violation.isCognizable ? "Cognizable" : "Non-Cognizable"
                    }
                    size="small"
                    color={violation.isCognizable ? "error" : "default"}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(violation.violationId)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(violation.violationId)}
                    >
                      <Delete fontSize="small" />
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
