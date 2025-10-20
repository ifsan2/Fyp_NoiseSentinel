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
import { Edit, Visibility, Devices, CheckCircle, Cancel } from '@mui/icons-material';
import { DeviceDto } from '@/models/Device';

interface DeviceTableProps {
  devices: DeviceDto[];
  onView: (deviceId: number) => void;
  onEdit: (deviceId: number) => void;
}

export const DeviceTable: React.FC<DeviceTableProps> = ({
  devices,
  onView,
  onEdit,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'secondary.main' }}>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Device Info</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Station</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Firmware</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Calibration</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Paired With</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {devices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No devices found
              </TableCell>
            </TableRow>
          ) : (
            devices.map((device) => (
              <TableRow key={device.deviceId} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Devices color="secondary" />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {device.deviceName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {device.deviceId}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {device.stationName || (
                    <Typography variant="body2" color="text.secondary">
                      Not Assigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={device.firmwareVersion} size="small" />
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip
                      label={device.calibrationStatus ? 'Calibrated' : 'Not Calibrated'}
                      size="small"
                      color={device.calibrationStatus ? 'success' : 'error'}
                      icon={device.calibrationStatus ? <CheckCircle /> : <Cancel />}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {formatDate(device.calibrationDate)}
                    </Typography>
                    {device.calibrationCertificateNo && (
                      <Typography variant="caption" color="text.secondary">
                        Cert: {device.calibrationCertificateNo}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {device.isPaired ? (
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {device.pairedOfficerName}
                      </Typography>
                      <Chip label="In Use" size="small" color="warning" sx={{ mt: 0.5 }} />
                    </Box>
                  ) : (
                    <Chip label="Available" size="small" color="success" />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={device.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={device.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onView(device.deviceId)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(device.deviceId)}
                    >
                      <Edit fontSize="small" />
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