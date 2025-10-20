import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Gavel,
  LocalPolice,
  AdminPanelSettings,
  PersonAdd,
  Groups,
  People, // ✅ ADD THIS IMPORT
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES } from '@/utils/constants';
import userApi from '@/api/userApi'; // ✅ ADD THIS IMPORT
import { UserCountsDto } from '@/models/User'; // ✅ ADD THIS IMPORT

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [counts, setCounts] = useState<UserCountsDto | null>(null); // ✅ ADD THIS STATE

  // ✅ ADD THIS EFFECT
  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const data = await userApi.getUserCounts();
      setCounts(data);
    } catch (error) {
      console.error('Failed to load counts:', error);
    }
  };

  const quickActions = [
    {
      title: 'View Users', // ✅ ADD THIS ACTION
      description: 'View and manage all users',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#8B5CF6',
      path: ROUTES.VIEW_USERS,
    },
    {
      title: 'Create Court Authority',
      description: 'Add new court administrator',
      icon: <Gavel sx={{ fontSize: 40 }} />,
      color: '#F59E0B',
      path: ROUTES.CREATE_COURT_AUTHORITY,
    },
    {
      title: 'Create Station Authority',
      description: 'Add new police station administrator',
      icon: <LocalPolice sx={{ fontSize: 40 }} />,
      color: '#3B82F6',
      path: ROUTES.CREATE_STATION_AUTHORITY,
    },
    {
      title: 'Create Admin',
      description: 'Add additional system administrator',
      icon: <AdminPanelSettings sx={{ fontSize: 40 }} />,
      color: '#10B981',
      path: ROUTES.CREATE_ADMIN,
    },
  ];

  // ✅ UPDATE STATS WITH REAL DATA
  const stats = [
    {
      label: 'Court Authorities',
      value: counts?.totalCourtAuthorities.toString() || '0',
      icon: <Gavel />,
      color: '#F59E0B',
    },
    {
      label: 'Station Authorities',
      value: counts?.totalStationAuthorities.toString() || '0',
      icon: <LocalPolice />,
      color: '#3B82F6',
    },
    {
      label: 'Total Users',
      value: counts?.totalUsers.toString() || '0',
      icon: <Groups />,
      color: '#10B981',
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Welcome to NoiseSentinel Administration"
      />

      {/* Welcome Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'white',
              color: 'primary.main',
              fontSize: '2rem',
              fontWeight: 700,
            }}
          >
            {user?.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
              Welcome, {user?.fullName}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              👤 {user?.role} • 📧 {user?.email}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: stat.color + '20',
                      color: stat.color,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <PageHeader title="🎯 Quick Actions" subtitle="Manage users and authorities" />

      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: action.color + '20',
                      color: action.color,
                      width: 80,
                      height: 80,
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  <Typography variant="h4" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {action.description}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PersonAdd />}
                    onClick={() => navigate(action.path)}
                    sx={{
                      bgcolor: action.color,
                      '&:hover': {
                        bgcolor: action.color,
                        filter: 'brightness(0.9)',
                      },
                    }}
                  >
                    {action.title.includes('View') ? 'View' : 'Create'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};