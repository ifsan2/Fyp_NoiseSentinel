import React from 'react';
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
} from '@mui/material';
import { Visibility, Report } from '@mui/icons-material';
import { FirDto } from '@/models/Fir';

interface FirTableProps {
  firs: FirDto[];
  onView: (firId: number) => void;
}

export const FirTable: React.FC<FirTableProps> = ({ firs, onView }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'filed':
        return 'info';
      case 'under investigation':
        return 'warning';
      case 'forwarded to court':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'error.main' }}>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>FIR Number</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Accused/Vehicle</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Violation</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Station/Officer</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Filed Date</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Case</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {firs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No FIRs found
              </TableCell>
            </TableRow>
          ) : (
            firs.map((fir) => (
              <TableRow key={fir.firid} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Report color="error" fontSize="small" />
                    <Typography variant="body2" fontWeight={600}>
                      {fir.firNumber}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {fir.accusedName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      CNIC: {fir.accusedCnic}
                    </Typography>
                    <br />
                    <Chip label={fir.vehiclePlate} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {fir.violationName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {fir.stationName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fir.stationCode}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      IO: {fir.informantName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(fir.filedDate)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={fir.status}
                    size="small"
                    color={getStatusColor(fir.status) as any}
                  />
                </TableCell>
                <TableCell>
                  {fir.hasCase ? (
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {fir.caseNumber}
                      </Typography>
                      <Chip
                        label={fir.caseStatus}
                        size="small"
                        color="primary"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No Case Yet
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onView(fir.firid)}
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