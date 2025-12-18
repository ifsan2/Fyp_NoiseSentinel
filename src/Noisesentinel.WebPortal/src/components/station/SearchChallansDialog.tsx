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
import challanApi from "@/api/challanApi";
import stationApi from "@/api/stationApi";
import violationApi from "@/api/violationApi";
import { ChallanDto } from "@/models/Challan";
import { PoliceStationDto } from "@/models/Station";
import { ViolationDto } from "@/models/Violation";
import { CHALLAN_STATUSES } from "@/utils/stationConstants";

interface SearchChallansDialogProps {
  open: boolean;
  onClose: () => void;
  onResults: (challans: ChallanDto[]) => void;
}

export const SearchChallansDialog: React.FC<SearchChallansDialogProps> = ({
  open,
  onClose,
  onResults,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<PoliceStationDto[]>([]);
  const [violations, setViolations] = useState<ViolationDto[]>([]);

  // Search criteria
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState("");
  const [accusedCnic, setAccusedCnic] = useState("");
  const [accusedName, setAccusedName] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleMakeYear, setVehicleMakeYear] = useState("");
  const [status, setStatus] = useState("");
  const [violationType, setViolationType] = useState("");
  const [stationId, setStationId] = useState("");
  const [issueDateFrom, setIssueDateFrom] = useState("");
  const [issueDateTo, setIssueDateTo] = useState("");

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [stationsData, violationsData] = await Promise.all([
        stationApi.getAllStations(),
        violationApi.getAllViolations(),
      ]);
      setStations(stationsData);
      setViolations(violationsData);
    } catch (error: any) {
      console.error("Failed to load data:", error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchDto = {
        vehiclePlateNumber: vehiclePlateNumber || undefined,
        accusedCnic: accusedCnic || undefined,
        accusedName: accusedName || undefined,
        vehicleMake: vehicleMake || undefined,
        vehicleMakeYear: vehicleMakeYear
          ? parseInt(vehicleMakeYear)
          : undefined,
        status: status || undefined,
        violationType: violationType || undefined,
        stationId: stationId ? parseInt(stationId) : undefined,
        issueDateFrom: issueDateFrom || undefined,
        issueDateTo: issueDateTo || undefined,
      };

      const response = await challanApi.searchChallans(searchDto);
      onResults(response.data || []);
      enqueueSnackbar(
        response.message || `Found ${response.count || 0} challan(s)`,
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
    setVehiclePlateNumber("");
    setAccusedCnic("");
    setAccusedName("");
    setVehicleMake("");
    setVehicleMakeYear("");
    setStatus("");
    setViolationType("");
    setStationId("");
    setIssueDateFrom("");
    setIssueDateTo("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Search />
          <Typography variant="h6">Advanced Challan Search</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
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
            <TextField
              fullWidth
              label="Vehicle Make"
              value={vehicleMake}
              onChange={(e) => setVehicleMake(e.target.value)}
              placeholder="e.g., Honda, Toyota"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Vehicle Make Year"
              type="number"
              value={vehicleMakeYear}
              onChange={(e) => setVehicleMakeYear(e.target.value)}
              placeholder="e.g., 2020"
              inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                {CHALLAN_STATUSES.map((statusOption) => (
                  <MenuItem key={statusOption} value={statusOption}>
                    {statusOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Violation Type</InputLabel>
              <Select
                value={violationType}
                onChange={(e) => setViolationType(e.target.value)}
                label="Violation Type"
              >
                <MenuItem value="">All</MenuItem>
                {violations.map((violation) => (
                  <MenuItem
                    key={violation.violationId}
                    value={violation.violationType}
                  >
                    {violation.violationType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Station</InputLabel>
              <Select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                label="Station"
              >
                <MenuItem value="">All</MenuItem>
                {stations.map((station) => (
                  <MenuItem key={station.stationId} value={station.stationId}>
                    {station.stationName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Issue Date From"
              type="date"
              value={issueDateFrom}
              onChange={(e) => setIssueDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Issue Date To"
              type="date"
              value={issueDateTo}
              onChange={(e) => setIssueDateTo(e.target.value)}
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
