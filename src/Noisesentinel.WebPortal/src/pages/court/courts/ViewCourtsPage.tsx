import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Refresh,
  FilterList,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES, PAKISTAN_PROVINCES } from "@/utils/courtConstants";
import courtApi from "@/api/courtApi";
import { CourtListItem } from "@/models/Court";

export const ViewCourtsPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [courts, setCourts] = useState<CourtListItem[]>([]);
  const [filteredCourts, setFilteredCourts] = useState<CourtListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("All");

  useEffect(() => {
    loadCourts();
  }, []);

  useEffect(() => {
    filterCourts();
  }, [searchQuery, selectedProvince, courts]);

  const loadCourts = async () => {
    setLoading(true);
    try {
      const data = await courtApi.getAllCourts();
      setCourts(data);
      setFilteredCourts(data);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load courts",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const filterCourts = () => {
    let filtered = [...courts];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (court) =>
          court.courtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          court.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
          court.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by province
    if (selectedProvince && selectedProvince !== "All") {
      filtered = filtered.filter(
        (court) => court.province === selectedProvince
      );
    }

    setFilteredCourts(filtered);
  };

  const handleDelete = async (courtId: number, courtName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${courtName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await courtApi.deleteCourt(courtId);
      enqueueSnackbar("Court deleted successfully", { variant: "success" });
      loadCourts();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to delete court",
        { variant: "error" }
      );
    }
  };

  const getCourtTypeColor = (type: string) => {
    switch (type) {
      case "Supreme Court":
        return "error";
      case "High Court":
        return "warning";
      case "District Court":
        return "info";
      case "Civil Court":
        return "success";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Courts"
        subtitle="Manage courts in the system"
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadCourts}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate(COURT_ROUTES.CREATE_COURT)}
            >
              Create Court
            </Button>
          </Box>
        }
      />

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search courts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Province"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterList />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="All">All Provinces</MenuItem>
            {PAKISTAN_PROVINCES.map((province) => (
              <MenuItem key={province} value={province}>
                {province}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {/* Results count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredCourts.length} of {courts.length} courts
        </Typography>
      </Box>

      {/* Courts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Court Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>District</TableCell>
              <TableCell>Province</TableCell>
              <TableCell align="center">Judges</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCourts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    No courts found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCourts.map((court) => (
                <TableRow key={court.courtId} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {court.courtName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={court.courtTypeName}
                      size="small"
                      color={getCourtTypeColor(court.courtTypeName)}
                    />
                  </TableCell>
                  <TableCell>{court.location}</TableCell>
                  <TableCell>{court.district}</TableCell>
                  <TableCell>{court.province}</TableCell>
                  <TableCell align="center">
                    <Chip label={court.totalJudges} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(
                            `${COURT_ROUTES.COURT_DETAIL}/${court.courtId}`
                          )
                        }
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Court">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(
                            `${COURT_ROUTES.EDIT_COURT}/${court.courtId}`
                          )
                        }
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Court">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          handleDelete(court.courtId, court.courtName)
                        }
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
    </Box>
  );
};
