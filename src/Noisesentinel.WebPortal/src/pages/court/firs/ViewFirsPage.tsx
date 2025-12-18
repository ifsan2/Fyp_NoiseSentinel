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
  CircularProgress,
  Typography,
  Tooltip,
} from "@mui/material";
import { Visibility, Search, Refresh, Assignment } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES } from "@/utils/courtConstants";
import firApi from "@/api/firApi";

export const ViewFirsPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [firs, setFirs] = useState<any[]>([]);
  const [filteredFirs, setFilteredFirs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFirs();
  }, []);

  useEffect(() => {
    filterFirs();
  }, [searchQuery, firs]);

  const loadFirs = async () => {
    setLoading(true);
    try {
      const data = await firApi.getAllFirs();
      setFirs(data);
      setFilteredFirs(data);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || "Failed to load FIRs", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFirs = () => {
    let filtered = [...firs];

    if (searchQuery) {
      filtered = filtered.filter(
        (fir: any) =>
          fir.firNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fir.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fir.accusedName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fir.accusedCnic?.includes(searchQuery) ||
          fir.vehiclePlateNumber
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          fir.violationType?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFirs(filtered);
  };

  const getFirStatusColor = (status: string) => {
    switch (status) {
      case "Filed":
        return "info";
      case "Under Investigation":
        return "warning";
      case "Forwarded to Court":
        return "success";
      case "Closed":
        return "default";
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
        title="FIRs (First Information Reports)"
        subtitle="View FIRs filed by police stations"
        actions={
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadFirs}>
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Search FIRs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Results count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredFirs.length} of {firs.length} FIRs
        </Typography>
      </Box>

      {/* FIRs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>FIR No.</TableCell>
              <TableCell>Station</TableCell>
              <TableCell>Filed Date</TableCell>
              <TableCell>Accused Name</TableCell>
              <TableCell>Vehicle Reg.</TableCell>
              <TableCell>Violation</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Case Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFirs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    No FIRs found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredFirs.map((fir: any) => (
                <TableRow key={fir.firId} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {fir.firNo}
                    </Typography>
                  </TableCell>
                  <TableCell>{fir.stationName}</TableCell>
                  <TableCell>
                    {fir.dateFiled
                      ? new Date(fir.dateFiled).toLocaleDateString()
                      : "Invalid Date"}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {fir.accusedName || "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fir.accusedCnic || ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {fir.vehiclePlateNumber || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      {fir.violationType || "N/A"}
                    </Typography>
                    {fir.soundLevelDBa && (
                      <Typography variant="caption" color="text.secondary">
                        {fir.soundLevelDBa} dBa
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={fir.firStatus || "Filed"}
                      size="small"
                      color={getFirStatusColor(fir.firStatus || "Filed")}
                    />
                  </TableCell>
                  <TableCell>
                    {fir.hasCase ? (
                      <Chip label="Has Case" size="small" color="success" />
                    ) : (
                      <Chip label="No Case" size="small" color="warning" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`${COURT_ROUTES.FIR_DETAIL}/${fir.firId}`)
                        }
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {!fir.hasCase && (
                      <Tooltip title="Create Case">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            navigate(
                              `${COURT_ROUTES.CREATE_CASE}?firId=${fir.firId}`
                            )
                          }
                        >
                          <Assignment fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
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
