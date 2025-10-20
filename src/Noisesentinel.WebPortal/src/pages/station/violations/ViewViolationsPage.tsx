import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Search, Add, Refresh } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { ViolationTable } from "@/components/station/tables/ViolationTable";
import { STATION_ROUTES } from "@/utils/stationConstants";
import violationApi from "@/api/violationApi";
import { ViolationDto } from "@/models/Violation";
import { stationFilters } from "@/utils/stationFilters";

export const ViewViolationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState<ViolationDto[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [cognizableFilter, setCognizableFilter] = useState<string>("all");

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    violationId: number | null;
    violationName: string;
  }>({ open: false, violationId: null, violationName: "" });

  useEffect(() => {
    loadViolations();
  }, []);

  const loadViolations = async () => {
    setLoading(true);
    try {
      const data = await violationApi.getAllViolations();
      setViolations(data);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load violations",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (violationId: number) => {
    navigate(`${STATION_ROUTES.EDIT_VIOLATION}/${violationId}`);
  };

  const handleDeleteClick = (violationId: number, violationName?: string) => {
    setDeleteDialog({
      open: true,
      violationId,
      violationName: violationName || "",
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.violationId) return;

    try {
      await violationApi.deleteViolation(deleteDialog.violationId);
      enqueueSnackbar("Violation deleted successfully", { variant: "success" });
      setDeleteDialog({ open: false, violationId: null, violationName: "" });
      loadViolations();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to delete violation",
        { variant: "error" }
      );
    }
  };

  const getFilteredViolations = () => {
    const isCognizable =
      cognizableFilter === "cognizable"
        ? true
        : cognizableFilter === "non-cognizable"
        ? false
        : undefined;

    return stationFilters.filterViolations(
      violations,
      searchQuery,
      isCognizable,
      undefined,
      undefined
    );
  };

  const filteredViolations = getFilteredViolations();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Violation Types"
        subtitle="Manage violation types and penalties"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "Violations" },
        ]}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadViolations}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate(STATION_ROUTES.CREATE_VIOLATION)}
            >
              Create Violation
            </Button>
          </>
        }
      />

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {/* Search */}
          <Grid item xs={12} md={6}>
            <TextField
              placeholder="Search violations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </Grid>

          {/* Cognizable Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={cognizableFilter}
                label="Type"
                onChange={(e) => setCognizableFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="cognizable">Cognizable</MenuItem>
                <MenuItem value="non-cognizable">Non-Cognizable</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Clear Filters */}
          {(searchQuery || cognizableFilter !== "all") && (
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchQuery("");
                  setCognizableFilter("all");
                }}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Results Count */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 2, bgcolor: "warning.light", borderRadius: 2 }}>
              <Box
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "warning.main",
                }}
              >
                {filteredViolations.length}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Violations Found
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 2 }}>
              <Box
                sx={{ fontSize: "2rem", fontWeight: 700, color: "error.main" }}
              >
                {filteredViolations.filter((v) => v.isCognizable).length}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Cognizable
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 2, bgcolor: "info.light", borderRadius: 2 }}>
              <Box
                sx={{ fontSize: "2rem", fontWeight: 700, color: "info.main" }}
              >
                {filteredViolations.filter((v) => !v.isCognizable).length}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Non-Cognizable
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Violations Table */}
      <ViolationTable
        violations={filteredViolations}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete violation{" "}
          <strong>{deleteDialog.violationName}</strong>?
          <br />
          This cannot be undone if the violation is not in use.
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
