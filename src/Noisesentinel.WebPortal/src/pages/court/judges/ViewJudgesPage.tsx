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
  Avatar,
} from "@mui/material";
import {
  Add,
  Edit,
  Visibility,
  Search,
  Refresh,
  CheckCircle,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES } from "@/utils/courtConstants";
import judgeApi from "@/api/judgeApi";
import { JudgeDetailsDto } from "@/models/User";

export const ViewJudgesPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [judges, setJudges] = useState<JudgeDetailsDto[]>([]);
  const [filteredJudges, setFilteredJudges] = useState<JudgeDetailsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadJudges();
  }, []);

  useEffect(() => {
    filterJudges();
  }, [searchQuery, judges]);

  const loadJudges = async () => {
    setLoading(true);
    try {
      const data = await judgeApi.getAllJudges();
      setJudges(data);
      setFilteredJudges(data);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load judges",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const filterJudges = () => {
    let filtered = [...judges];

    if (searchQuery) {
      filtered = filtered.filter(
        (judge) =>
          judge.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          judge.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          judge.cnic.includes(searchQuery) ||
          judge.courtName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredJudges(filtered);
  };

  const handleToggleStatus = async (
    judgeId: number,
    isActive: boolean,
    fullName: string
  ) => {
    try {
      if (isActive) {
        await judgeApi.deactivateJudge(judgeId);
        enqueueSnackbar(`Judge ${fullName} deactivated successfully`, {
          variant: "success",
        });
      } else {
        await judgeApi.activateJudge(judgeId);
        enqueueSnackbar(`Judge ${fullName} activated successfully`, {
          variant: "success",
        });
      }
      loadJudges();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update judge status",
        { variant: "error" }
      );
    }
  };

  const getInitials = (fullName: string): string => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
        title="Judges"
        subtitle="Manage judges in the system"
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadJudges}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate(COURT_ROUTES.CREATE_JUDGE)}
            >
              Create Judge
            </Button>
          </Box>
        }
      />

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Search judges..."
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
          Showing {filteredJudges.length} of {judges.length} judges
        </Typography>
      </Box>

      {/* Judges Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Judge</TableCell>
              <TableCell>Rank</TableCell>
              <TableCell>Court</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="center">Cases</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredJudges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    No judges found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredJudges.map((judge) => (
                <TableRow key={judge.judgeId} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {getInitials(judge.fullName)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {judge.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {judge.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{judge.rank || "N/A"}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{judge.courtName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {judge.courtType}
                    </Typography>
                  </TableCell>
                  <TableCell>{judge.contactNo}</TableCell>
                  <TableCell align="center">
                    <Chip label={judge.totalCases} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    {judge.isActive ? (
                      <Chip
                        label="Active"
                        size="small"
                        color="success"
                        icon={<CheckCircle />}
                      />
                    ) : (
                      <Chip label="Inactive" size="small" color="error" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(
                            `${COURT_ROUTES.JUDGE_DETAIL}/${judge.judgeId}`
                          )
                        }
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Judge">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(
                            `${COURT_ROUTES.EDIT_JUDGE}/${judge.judgeId}`
                          )
                        }
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={judge.isActive ? "Deactivate" : "Activate"}>
                      <IconButton
                        size="small"
                        color={judge.isActive ? "error" : "success"}
                        onClick={() =>
                          handleToggleStatus(
                            judge.judgeId,
                            judge.isActive,
                            judge.fullName
                          )
                        }
                      >
                        {judge.isActive ? (
                          <CancelIcon fontSize="small" />
                        ) : (
                          <CheckCircle fontSize="small" />
                        )}
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
