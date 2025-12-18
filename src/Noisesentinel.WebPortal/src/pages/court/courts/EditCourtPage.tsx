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
} from "@mui/material";
import { Save, Cancel } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { FormCard } from "@/components/common/FormCard";
import { COURT_ROUTES, PAKISTAN_PROVINCES } from "@/utils/courtConstants";
import courtApi from "@/api/courtApi";
import { UpdateCourtDto, CourtType } from "@/models/Court";

export const EditCourtPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateCourtDto>();

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [types, courtData] = await Promise.all([
        courtApi.getCourtTypes(),
        courtApi.getCourtById(parseInt(id!)),
      ]);

      setCourtTypes(types);
      reset({
        courtId: courtData.courtId,
        courtName: courtData.courtName,
        courtTypeId: courtData.courtTypeId,
        location: courtData.location,
        district: courtData.district,
        province: courtData.province,
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load court data",
        { variant: "error" }
      );
      navigate(COURT_ROUTES.COURTS);
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: UpdateCourtDto) => {
    setLoading(true);
    try {
      await courtApi.updateCourt(data);
      enqueueSnackbar("Court updated successfully", {
        variant: "success",
      });
      navigate(COURT_ROUTES.COURTS);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update court",
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
        title="Edit Court"
        subtitle="Update court information"
        breadcrumbs={[
          { label: "Dashboard", path: COURT_ROUTES.DASHBOARD },
          { label: "Courts", path: COURT_ROUTES.COURTS },
          { label: "Edit Court" },
        ]}
      />

      <FormCard title="Court Information">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Court Name */}
            <Grid item xs={12} md={6}>
              <Controller
                name="courtName"
                control={control}
                rules={{ required: "Court name is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Court Name"
                    error={!!errors.courtName}
                    helperText={errors.courtName?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Court Type */}
            <Grid item xs={12} md={6}>
              <Controller
                name="courtTypeId"
                control={control}
                rules={{ required: "Court type is required" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.courtTypeId} required>
                    <InputLabel>Court Type</InputLabel>
                    <Select {...field} label="Court Type">
                      <MenuItem value="">Select Court Type</MenuItem>
                      {courtTypes.map((type) => (
                        <MenuItem
                          key={type.courtTypeId}
                          value={type.courtTypeId}
                        >
                          {type.courtTypeName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Controller
                name="location"
                control={control}
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Location/Address"
                    error={!!errors.location}
                    helperText={errors.location?.message}
                    required
                    multiline
                    rows={2}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* District */}
            <Grid item xs={12} md={6}>
              <Controller
                name="district"
                control={control}
                rules={{ required: "District is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="District"
                    error={!!errors.district}
                    helperText={errors.district?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Province */}
            <Grid item xs={12} md={6}>
              <Controller
                name="province"
                control={control}
                rules={{ required: "Province is required" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.province} required>
                    <InputLabel>Province</InputLabel>
                    <Select {...field} label="Province">
                      <MenuItem value="">Select Province</MenuItem>
                      {PAKISTAN_PROVINCES.map((province) => (
                        <MenuItem key={province} value={province}>
                          {province}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate(COURT_ROUTES.COURTS)}
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
                  {loading ? "Updating..." : "Update Court"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormCard>
    </Box>
  );
};
