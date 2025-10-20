import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Edit, Business, Phone, LocationOn } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { PageHeader } from '@/components/common/PageHeader';
import { STATION_ROUTES } from '@/utils/stationConstants';
import stationApi from '@/api/stationApi';
import stationOfficerApi from '@/api/stationOfficerApi';
import deviceApi from '@/api/deviceApi';
import { PoliceStationDto } from '@/models/Station';

export const StationDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<PoliceStationDto | null>(null);
  const [stats, setStats] = useState({
    totalOfficers: 0,
    activeOfficers: 0,
    investigationOfficers: 0,
    totalDevices: 0,
    devicesInUse: 0,
  });

  useEffect(() => {
    if (id) {
      loadStationDetails();
    }
  }, [id]);

  const loadStationDetails = async () => {
    setLoading(true);
    try {
      const [stationData, officers, devices] = await Promise.all([
        stationApi.getStationById(parseInt(id!)),
        stationOfficerApi.getAllOfficers(),
        deviceApi.getAllDevices(),
      ]);

      setStation(stationData);

      // Calculate stats for this station
      const stationOfficers = officers.filter(
        (o) => o.stationId === parseInt(id!)
      );
      const stationDevices = devices.filter(
        (d) => d.stationId === parseInt(id!)
      );

      setStats({
        totalOfficers: stationOfficers.length,
        activeOfficers: stationOfficers.filter((o) => o.isActive).length,
        investigationOfficers: stationOfficers.filter(
          (o) => o.isInvestigationOfficer
        ).length,
        totalDevices: stationDevices.length,
        devicesInUse: stationDevices.filter((d) => d.isPaired).length,
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to load station details',
        { variant: 'error' }
      );
      navigate(STATION_ROUTES.STATIONS);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!station) {
    return null;
  }

  return (
    <Box>
      <PageHeader
        title={station.stationName}
        subtitle="Police Station Details"
        breadcrumbs={[
          { label: 'Dashboard', path: STATION_ROUTES.DASHBOARD },
          { label: 'Police Stations', path: STATION_ROUTES.STATIONS },
          { label: station.stationName },
        ]}
        actions={
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`${STATION_ROUTES.EDIT_STATION}/${id}`)}
          >
            Edit Station
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* Station Information Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Business sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={600}>
                  Station Information
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Station Code
                  </Typography>
                  <Typography variant="h6">
                    <Chip label={station.stationCode} color="primary" />
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Location
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mt: 0.5 }}>
                    <LocationOn color="action" />
                    <Typography variant="body1">
                      {station.location || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    District
                  </Typography>
                  <Typography variant="body1">{station.district || 'N/A'}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Province
                  </Typography>
                  <Typography variant="body1">{station.province || 'N/A'}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Contact Number
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Phone color="action" />
                    <Typography variant="body1">
                      {station.contact || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Station Statistics
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="primary.main" fontWeight={700}>
                      {stats.totalOfficers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Officers
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="success.main" fontWeight={700}>
                      {stats.activeOfficers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Officers
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="warning.main" fontWeight={700}>
                      {stats.investigationOfficers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Investigation Officers
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="info.main" fontWeight={700}>
                      {stats.totalDevices}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      IoT Devices
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="secondary.main" fontWeight={700}>
                      {stats.devicesInUse}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Devices In Use
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() =>
                      navigate(
                        `${STATION_ROUTES.OFFICERS}?stationId=${station.stationId}`
                      )
                    }
                  >
                    View Officers
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() =>
                      navigate(
                        `${STATION_ROUTES.DEVICES}?stationId=${station.stationId}`
                      )
                    }
                  >
                    View Devices
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() =>
                      navigate(
                        `${STATION_ROUTES.CHALLANS}?stationId=${station.stationId}`
                      )
                    }
                  >
                    View Challans
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() =>
                      navigate(
                        `${STATION_ROUTES.FIRS}?stationId=${station.stationId}`
                      )
                    }
                  >
                    View FIRs
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};