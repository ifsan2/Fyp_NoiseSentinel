import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Avatar,
} from '@mui/material';
import { Person, Email, AccountCircle, AdminPanelSettings } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES } from '@/utils/constants';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <PageHeader
        title="Profile"
        subtitle="Your account information"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.DASHBOARD },
          { label: 'Profile' },
        ]}
      />

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem',
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
                  <Typography variant="h3" gutterBottom>
                    {user?.fullName}
                  </Typography>
                  <Chip
                    icon={<AdminPanelSettings />}
                    label={user?.role}
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccountCircle color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Username
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {user?.username}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Email color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email Address
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Person color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        User ID
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {user?.userId}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Session Info */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom>
                Session Information
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Token Expires At
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {user?.expiresAt ? formatDate(user.expiresAt) : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Account Status
                </Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  ✓ Active
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Authentication Method
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  JWT Token
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};