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
import { Edit, Delete, Visibility, Business } from "@mui/icons-material";
import { PoliceStationDto } from "@/models/Station";

interface StationTableProps {
  stations: PoliceStationDto[];
  onView: (stationId: number) => void;
  onEdit: (stationId: number) => void;
  onDelete: (stationId: number, stationName?: string) => void;
  showActions?: boolean;
}

export const StationTable: React.FC<StationTableProps> = ({
  stations,
  onView,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "primary.main" }}>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Station Info
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>Code</TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Location
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              District
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Province
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>
              Contact
            </TableCell>
            {showActions && (
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {stations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 7 : 6} align="center">
                No stations found
              </TableCell>
            </TableRow>
          ) : (
            stations.map((station) => (
              <TableRow key={station.stationId} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Business color="primary" />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {station.stationName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {station.stationId}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={station.stationCode}
                    size="small"
                    color="primary"
                  />
                </TableCell>
                <TableCell>{station.location || "-"}</TableCell>
                <TableCell>{station.district || "-"}</TableCell>
                <TableCell>{station.province || "-"}</TableCell>
                <TableCell>{station.contact || "-"}</TableCell>
                {showActions && (
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => onView(station.stationId)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(station.stationId)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(station.stationId)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
