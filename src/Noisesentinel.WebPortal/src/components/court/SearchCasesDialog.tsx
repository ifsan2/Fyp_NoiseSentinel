import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import caseApi from "@/api/caseApi";
import judgeApi from "@/api/judgeApi";
import { CaseListItem } from "@/models/Case";
import { JudgeDetailsDto } from "@/models/User";
import { CASE_STATUSES, CASE_TYPES } from "@/utils/courtConstants";

interface SearchCasesDialogProps {
  open: boolean;
  onClose: () => void;
  onResults: (cases: CaseListItem[]) => void;
}

export const SearchCasesDialog: React.FC<SearchCasesDialogProps> = ({
  open,
  onClose,
  onResults,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [judges, setJudges] = useState<JudgeDetailsDto[]>([]);

  // Search criteria
  const [caseNo, setCaseNo] = useState("");
  const [firNo, setFirNo] = useState("");
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState("");
  const [accusedCnic, setAccusedCnic] = useState("");
  const [accusedName, setAccusedName] = useState("");
  const [caseStatus, setCaseStatus] = useState("");
  const [caseType, setCaseType] = useState("");
  const [judgeId, setJudgeId] = useState("");
  const [hearingDateFrom, setHearingDateFrom] = useState("");
  const [hearingDateTo, setHearingDateTo] = useState("");

  useEffect(() => {
    if (open) {
      loadJudges();
    }
  }, [open]);

  const loadJudges = async () => {
    try {
      const data = await judgeApi.getAllJudges();
      setJudges(data);
    } catch (error: any) {
      console.error("Failed to load judges:", error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchDto = {
        caseNo: caseNo || undefined,
        firNo: firNo || undefined,
        vehiclePlateNumber: vehiclePlateNumber || undefined,
        accusedCnic: accusedCnic || undefined,
        accusedName: accusedName || undefined,
        caseStatus: caseStatus || undefined,
        caseType: caseType || undefined,
        judgeId: judgeId ? parseInt(judgeId) : undefined,
        hearingDateFrom: hearingDateFrom || undefined,
        hearingDateTo: hearingDateTo || undefined,
      };

      const response = await caseApi.searchCases(searchDto);
      onResults(response.data || []);
      enqueueSnackbar(
        response.message || `Found ${response.count || 0} case(s)`,
        { variant: "success" }
      );
      onClose();
    } catch (error: any) {
      console.error("Search failed:", error);
      enqueueSnackbar(error.response?.data?.message || "Search failed", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCaseNo("");
    setFirNo("");
    setVehiclePlateNumber("");
    setAccusedCnic("");
    setAccusedName("");
    setCaseStatus("");
    setCaseType("");
    setJudgeId("");
    setHearingDateFrom("");
    setHearingDateTo("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Search />
          <Typography variant="h6">Advanced Case Search</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Case Number"
              value={caseNo}
              onChange={(e) => setCaseNo(e.target.value)}
              placeholder="e.g., C-2024-001"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="FIR Number"
              value={firNo}
              onChange={(e) => setFirNo(e.target.value)}
              placeholder="e.g., FIR-2024-001"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Vehicle Plate Number"
              value={vehiclePlateNumber}
              onChange={(e) => setVehiclePlateNumber(e.target.value)}
              placeholder="e.g., PK-ABC-123"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Accused CNIC"
              value={accusedCnic}
              onChange={(e) => setAccusedCnic(e.target.value)}
              placeholder="e.g., 35202-1234567-8"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Accused Name"
              value={accusedName}
              onChange={(e) => setAccusedName(e.target.value)}
              placeholder="e.g., Ahmed Ali"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Case Status</InputLabel>
              <Select
                value={caseStatus}
                onChange={(e) => setCaseStatus(e.target.value)}
                label="Case Status"
              >
                <MenuItem value="">All</MenuItem>
                {CASE_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Case Type</InputLabel>
              <Select
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                label="Case Type"
              >
                <MenuItem value="">All</MenuItem>
                {CASE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Judge</InputLabel>
              <Select
                value={judgeId}
                onChange={(e) => setJudgeId(e.target.value)}
                label="Judge"
              >
                <MenuItem value="">All</MenuItem>
                {judges.map((judge) => (
                  <MenuItem key={judge.judgeId} value={judge.judgeId}>
                    {judge.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hearing Date From"
              type="date"
              value={hearingDateFrom}
              onChange={(e) => setHearingDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hearing Date To"
              type="date"
              value={hearingDateTo}
              onChange={(e) => setHearingDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear} startIcon={<Clear />} disabled={loading}>
          Clear
        </Button>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSearch}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Search />}
          disabled={loading}
        >
          Search
        </Button>
      </DialogActions>
    </Dialog>
  );
};
