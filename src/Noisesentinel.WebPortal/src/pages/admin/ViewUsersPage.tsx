import React, { useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Search, Refresh } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { UserTable } from "@/components/admin/UserTable";
import { JudgeTable } from "@/components/admin/JudgeTable";
import { OfficerTable } from "@/components/admin/OfficerTable";
import { ViewUserDialog } from "@/components/admin/ViewUserDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { ROUTES } from "@/utils/constants";
import userApi from "@/api/userApi";
import {
  UserListItemDto,
  JudgeDetailsDto,
  PoliceOfficerDetailsDto,
  UserCountsDto,
} from "@/models/User";
import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const ViewUsersPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Data states
  const [admins, setAdmins] = useState<UserListItemDto[]>([]);
  const [courtAuthorities, setCourtAuthorities] = useState<UserListItemDto[]>(
    []
  );
  const [stationAuthorities, setStationAuthorities] = useState<
    UserListItemDto[]
  >([]);
  const [judges, setJudges] = useState<JudgeDetailsDto[]>([]);
  const [officers, setOfficers] = useState<PoliceOfficerDetailsDto[]>([]);
  const [counts, setCounts] = useState<UserCountsDto | null>(null);

  // View dialog
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    userId: number | null;
  }>({ open: false, userId: null });

  // Edit dialog
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    userId: number | null;
    judgeId: number | null;
    officerId: number | null;
    type: "user" | "judge" | "officer";
  }>({
    open: false,
    userId: null,
    judgeId: null,
    officerId: null,
    type: "user",
  });

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    userId?: number;
    judgeId?: number;
    officerId?: number;
    type: "user" | "judge" | "officer";
    name: string;
  }>({ open: false, type: "user", name: "" });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        adminsData,
        courtAuthData,
        stationAuthData,
        judgesData,
        officersData,
        countsData,
      ] = await Promise.all([
        userApi.getAllAdmins(),
        userApi.getAllCourtAuthorities(),
        userApi.getAllStationAuthorities(),
        userApi.getAllJudges(),
        userApi.getAllPoliceOfficers(),
        userApi.getUserCounts(),
      ]);

      setAdmins(adminsData);
      setCourtAuthorities(courtAuthData);
      setStationAuthorities(stationAuthData);
      setJudges(judgesData);
      setOfficers(officersData);
      setCounts(countsData);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || "Failed to load users", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchQuery("");
    setStatusFilter("all");
  };

  const handleView = (userId: number) => {
    setViewDialog({ open: true, userId });
  };

  const handleEdit = (
    id: number,
    type: "user" | "judge" | "officer" = "user"
  ) => {
    if (type === "judge") {
      const judge = judges.find((j) => j.judgeId === id);
      if (judge) {
        setEditDialog({
          open: true,
          userId: judge.userId,
          judgeId: id,
          officerId: null,
          type: "judge",
        });
      }
    } else if (type === "officer") {
      const officer = officers.find((o) => o.officerId === id);
      if (officer) {
        setEditDialog({
          open: true,
          userId: officer.userId,
          judgeId: null,
          officerId: id,
          type: "officer",
        });
      }
    } else {
      setEditDialog({
        open: true,
        userId: id,
        judgeId: null,
        officerId: null,
        type: "user",
      });
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await userApi.deactivateUser(userId);
        enqueueSnackbar("User deactivated successfully", {
          variant: "success",
        });
      } else {
        await userApi.activateUser(userId);
        enqueueSnackbar("User activated successfully", { variant: "success" });
      }
      loadAllData();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update user status",
        { variant: "error" }
      );
    }
  };

  const handleToggleJudgeStatus = async (
    judgeId: number,
    currentStatus: boolean
  ) => {
    try {
      if (currentStatus) {
        await userApi.deactivateJudge(judgeId);
        enqueueSnackbar("Judge deactivated successfully", {
          variant: "success",
        });
      } else {
        await userApi.activateJudge(judgeId);
        enqueueSnackbar("Judge activated successfully", { variant: "success" });
      }
      loadAllData();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update judge status",
        { variant: "error" }
      );
    }
  };

  const handleToggleOfficerStatus = async (
    officerId: number,
    currentStatus: boolean
  ) => {
    try {
      if (currentStatus) {
        await userApi.deactivatePoliceOfficer(officerId);
        enqueueSnackbar("Police officer deactivated successfully", {
          variant: "success",
        });
      } else {
        await userApi.activatePoliceOfficer(officerId);
        enqueueSnackbar("Police officer activated successfully", {
          variant: "success",
        });
      }
      loadAllData();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message ||
          "Failed to update police officer status",
        { variant: "error" }
      );
    }
  };

  const handleDeleteClick = (
    type: "user" | "judge" | "officer",
    id: number,
    name: string
  ) => {
    if (type === "user") {
      setDeleteDialog({ open: true, userId: id, type, name });
    } else if (type === "judge") {
      setDeleteDialog({ open: true, judgeId: id, type, name });
    } else {
      setDeleteDialog({ open: true, officerId: id, type, name });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteDialog.type === "user" && deleteDialog.userId) {
        await userApi.deleteUser(deleteDialog.userId);
      } else if (deleteDialog.type === "judge" && deleteDialog.judgeId) {
        await userApi.deleteJudge(deleteDialog.judgeId);
      } else if (deleteDialog.type === "officer" && deleteDialog.officerId) {
        await userApi.deletePoliceOfficer(deleteDialog.officerId);
      }

      enqueueSnackbar("User deleted successfully", { variant: "success" });
      setDeleteDialog({ open: false, type: "user", name: "" });
      loadAllData();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to delete user",
        { variant: "error" }
      );
    }
  };

  const filterUsers = (users: UserListItemDto[]) => {
    return users.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesStatus;
    });
  };

  const filterJudges = (judges: JudgeDetailsDto[]) => {
    return judges.filter((judge) => {
      const matchesSearch =
        !searchQuery ||
        judge.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        judge.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        judge.courtName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && judge.isActive) ||
        (statusFilter === "inactive" && !judge.isActive);

      return matchesSearch && matchesStatus;
    });
  };

  const filterOfficers = (officers: PoliceOfficerDetailsDto[]) => {
    return officers.filter((officer) => {
      const matchesSearch =
        !searchQuery ||
        officer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && officer.isActive) ||
        (statusFilter === "inactive" && !officer.isActive);

      return matchesSearch && matchesStatus;
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="User Management"
        subtitle="View and manage all system users"
        breadcrumbs={[
          { label: "Dashboard", path: ROUTES.DASHBOARD },
          { label: "User Management" },
        ]}
        actions={
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadAllData}
          >
            Refresh
          </Button>
        }
      />

      {/* Statistics Cards */}
      {counts && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary">
                  {counts.totalAdmins}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Admins
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="warning.main">
                  {counts.totalCourtAuthorities}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Court Auth
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="info.main">
                  {counts.totalStationAuthorities}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Station Auth
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="secondary.main">
                  {counts.totalJudges}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Judges
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {counts.totalPoliceOfficers}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Officers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="text.primary">
                  {counts.totalUsers}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search & Filter */}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <TextField
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Admins (${admins.length})`} />
          <Tab label={`Court Authorities (${courtAuthorities.length})`} />
          <Tab label={`Station Authorities (${stationAuthorities.length})`} />
          <Tab label={`Judges (${judges.length})`} />
          <Tab label={`Police Officers (${officers.length})`} />
        </Tabs>
      </Box>

      {/* Admins Tab */}
      <TabPanel value={activeTab} index={0}>
        <UserTable
          users={filterUsers(admins)}
          onView={handleView}
          onEdit={(id) => handleEdit(id, "user")}
          onDelete={(id) => {
            const userToDelete = admins.find((u) => u.userId === id);
            if (userToDelete)
              handleDeleteClick("user", id, userToDelete.fullName);
          }}
          onToggleStatus={handleToggleStatus}
          currentUserId={user?.userId}
          totalAdmins={admins.length}
        />
      </TabPanel>

      {/* Court Authorities Tab */}
      <TabPanel value={activeTab} index={1}>
        <UserTable
          users={filterUsers(courtAuthorities)}
          onView={handleView}
          onEdit={(id) => handleEdit(id, "user")}
          onDelete={(id) => {
            const userToDelete = courtAuthorities.find((u) => u.userId === id);
            if (userToDelete)
              handleDeleteClick("user", id, userToDelete.fullName);
          }}
          onToggleStatus={handleToggleStatus}
        />
      </TabPanel>

      {/* Station Authorities Tab */}
      <TabPanel value={activeTab} index={2}>
        <UserTable
          users={filterUsers(stationAuthorities)}
          onView={handleView}
          onEdit={(id) => handleEdit(id, "user")}
          onDelete={(id) => {
            const userToDelete = stationAuthorities.find(
              (u) => u.userId === id
            );
            if (userToDelete)
              handleDeleteClick("user", id, userToDelete.fullName);
          }}
          onToggleStatus={handleToggleStatus}
        />
      </TabPanel>

      {/* Judges Tab */}
      <TabPanel value={activeTab} index={3}>
        {isAdmin && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Admin View:</strong> You can view judge details but cannot
            edit or delete. Only Court Authority can manage judges.
          </Alert>
        )}
        <JudgeTable
          judges={filterJudges(judges)}
          onView={handleView}
          onEdit={(judgeId) => handleEdit(judgeId, "judge")}
          onToggleStatus={handleToggleJudgeStatus}
          onDelete={(judgeId) => {
            const judge = judges.find((j) => j.judgeId === judgeId);
            if (judge) handleDeleteClick("judge", judgeId, judge.fullName);
          }}
        />
      </TabPanel>

      {/* Police Officers Tab */}
      <TabPanel value={activeTab} index={4}>
        {isAdmin && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Admin View:</strong> You can view officer details but cannot
            edit or delete. Only Station Authority can manage police officers.
          </Alert>
        )}
        <OfficerTable
          officers={filterOfficers(officers)}
          onView={handleView}
          onEdit={(officerId) => handleEdit(officerId, "officer")}
          onToggleStatus={handleToggleOfficerStatus}
          onDelete={(officerId) => {
            const officer = officers.find((o) => o.officerId === officerId);
            if (officer)
              handleDeleteClick("officer", officerId, officer.fullName);
          }}
        />
      </TabPanel>

      {/* View User Dialog */}
      <ViewUserDialog
        open={viewDialog.open}
        userId={viewDialog.userId}
        onClose={() => setViewDialog({ open: false, userId: null })}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialog.open}
        userId={editDialog.userId}
        judgeId={editDialog.judgeId}
        officerId={editDialog.officerId}
        type={editDialog.type}
        onClose={() =>
          setEditDialog({
            open: false,
            userId: null,
            judgeId: null,
            officerId: null,
            type: "user",
          })
        }
        onSuccess={loadAllData}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{deleteDialog.name}</strong>?
          <br />
          This will deactivate the user account.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
