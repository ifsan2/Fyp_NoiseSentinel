import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Save, Cancel } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { FormCard } from "@/components/common/FormCard";
import { COURT_ROUTES, JUDGE_RANKS } from "@/utils/courtConstants";
import judgeApi from "@/api/judgeApi";
import courtApi from "@/api/courtApi";
import { CourtListItem } from "@/models/Court";

interface UpdateJudgeFormData {
  fullName: string;
  email: string;
  cnic: string;
  contactNo: string;
  rank: string;
  courtId: number;
  serviceStatus: boolean;
}

export const EditJudgePage: React.FC = () => {
  const navigate = useNavigate();
  const { judgeId } = useParams<{ judgeId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [courts, setCourts] = useState<CourtListItem[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateJudgeFormData>();

  useEffect(() => {
    if (judgeId) {
      loadInitialData();
    }
  }, [judgeId]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      // Get all judges and find by judgeId (similar to officer pattern)
      const [courtsData, judges] = await Promise.all([
        courtApi.getAllCourts(),
        judgeApi.getAllJudges(),
      ]);

      const judgeData = judges.find((j) => j.judgeId === parseInt(judgeId!));

      if (!judgeData) {
        throw new Error("Judge not found");
      }

      setCourts(courtsData);
      reset({
        fullName: judgeData.fullName,
        email: judgeData.email,
        cnic: judgeData.cnic,
        contactNo: judgeData.contactNo,
        rank: judgeData.rank,
        courtId: judgeData.courtId,
        serviceStatus: judgeData.serviceStatus,
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load judge data",
        { variant: "error" }
      );
      navigate(COURT_ROUTES.JUDGES);
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: UpdateJudgeFormData) => {
    setLoading(true);
    try {
      await judgeApi.updateJudge(parseInt(judgeId!), {
        fullName: data.fullName,
        email: data.email,
        cnic: data.cnic,
        contactNo: data.contactNo,
        rank: data.rank,
        courtId: data.courtId,
        serviceStatus: data.serviceStatus,
      });

      enqueueSnackbar("Judge updated successfully", {
        variant: "success",
      });
      navigate(COURT_ROUTES.JUDGES);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update judge",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Edit Judge"
        subtitle="Update judge information"
        breadcrumbs={[
          { label: "Dashboard", path: COURT_ROUTES.DASHBOARD },
          { label: "Judges", path: COURT_ROUTES.JUDGES },
          { label: "Edit Judge" },
        ]}
      />

      <FormCard title="Judge Information">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Full Name */}
            <Grid item xs={12} md={6}>
              <Controller
                name="fullName"
                control={control}
                rules={{ required: "Full name is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* CNIC */}
            <Grid item xs={12} md={6}>
              <Controller
                name="cnic"
                control={control}
                rules={{
                  required: "CNIC is required",
                  pattern: {
                    value: /^\d{5}-\d{7}-\d{1}$/,
                    message: "CNIC must be in format: 12345-1234567-1",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CNIC"
                    placeholder="12345-1234567-1"
                    error={!!errors.cnic}
                    helperText={errors.cnic?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Contact Number */}
            <Grid item xs={12} md={6}>
              <Controller
                name="contactNo"
                control={control}
                rules={{
                  required: "Contact number is required",
                  pattern: {
                    value: /^(\+92|0)?[0-9]{10}$/,
                    message: "Invalid phone number",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Number"
                    placeholder="+923001234567"
                    error={!!errors.contactNo}
                    helperText={errors.contactNo?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Rank */}
            <Grid item xs={12} md={6}>
              <Controller
                name="rank"
                control={control}
                rules={{ required: "Rank is required" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.rank} required>
                    <InputLabel>Rank</InputLabel>
                    <Select {...field} label="Rank">
                      <MenuItem value="">Select Rank</MenuItem>
                      {JUDGE_RANKS.map((rank) => (
                        <MenuItem key={rank} value={rank}>
                          {rank}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Court Assignment */}
            <Grid item xs={12} md={6}>
              <Controller
                name="courtId"
                control={control}
                rules={{ required: "Court assignment is required" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.courtId} required>
                    <InputLabel>Assign to Court</InputLabel>
                    <Select {...field} label="Assign to Court">
                      <MenuItem value="">Select Court</MenuItem>
                      {courts.map((court) => (
                        <MenuItem key={court.courtId} value={court.courtId}>
                          {court.courtName} - {court.courtTypeName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Service Status */}
            <Grid item xs={12}>
              <Controller
                name="serviceStatus"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        color="primary"
                      />
                    }
                    label="Currently in Service"
                  />
                )}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate(COURT_ROUTES.JUDGES)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Judge"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormCard>
    </Box>
  );
};
