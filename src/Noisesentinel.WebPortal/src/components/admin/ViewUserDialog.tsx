import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Person,
  Email,
  Badge,
  Phone,
  LocationOn,
  Gavel,
  LocalPolice,
  AdminPanelSettings,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import userApi from "@/api/userApi";
import { UserDetailsDto } from "@/models/User";

interface ViewUserDialogProps {
  open: boolean;
  userId: number | null;
  onClose: () => void;
}

export const ViewUserDialog: React.FC<ViewUserDialogProps> = ({
  open,
  userId,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserDetailsDto | null>(null);

  useEffect(() => {
    if (open && userId) {
      loadUser();
    }
  }, [open, userId]);

  const loadUser = async () => {
    if (!userId) return;

    setLoading(true);
    setError("");
    try {
      const data = await userApi.getUserById(userId);
      setUser(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <AdminPanelSettings />;
      case "Judge":
        return <Gavel />;
      case "Police Officer":
        return <LocalPolice />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "error";
      case "Judge":
        return "warning";
      case "Police Officer":
        return "info";
      case "Court Authority":
        return "secondary";
      case "Station Authority":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Person />
          User Details
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && user && (
          <Box>
            {/* Basic Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Person color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {user.fullName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Badge color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Username
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {user.username}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Email color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    {getRoleIcon(user.role)}
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Role
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    {user.isActive ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={user.isActive ? "Active" : "Inactive"}
                          color={user.isActive ? "success" : "default"}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Account Created
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDate(user.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Judge-Specific Details */}
            {user.role === "Judge" && user.judgeId && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Judge Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Badge color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            CNIC
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {user.cnic}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Phone color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Contact Number
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {user.contactNo}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Rank
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {user.rank}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Gavel color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Court
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {user.courtName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.courtType}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocationOn color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Court Location
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {user.courtLocation}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}

            {/* Police Officer-Specific Details */}
            {user.role === "Police Officer" && user.officerId && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Police Officer Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Badge color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            CNIC
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {user.cnic}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Phone color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Contact Number
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {user.contactNo}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Badge Number
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {user.badgeNumber}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Rank
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {user.rank}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Investigation Officer
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={user.isInvestigationOfficer ? "Yes" : "No"}
                            color={
                              user.isInvestigationOfficer
                                ? "warning"
                                : "default"
                            }
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocalPolice color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Station
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {user.stationName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.stationCode}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocationOn color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Station Location
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {user.stationLocation}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {user.postingDate && (
                      <Grid item xs={12}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Posting Date
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formatDate(user.postingDate)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
