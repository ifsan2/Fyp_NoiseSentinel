import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import userApi from "@/api/userApi";
import {
  UpdateUserDto,
  UpdateJudgeDto,
  UpdatePoliceOfficerDto,
} from "@/models/User";
import { validation, validationMessages } from "@/utils/validation";

interface EditUserDialogProps {
  open: boolean;
  userId: number | null;
  judgeId: number | null;
  officerId: number | null;
  type: "user" | "judge" | "officer";
  onClose: () => void;
  onSuccess: () => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  userId,
  judgeId,
  officerId,
  type,
  onClose,
  onSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserDto | UpdateJudgeDto | UpdatePoliceOfficerDto>();

  useEffect(() => {
    if (open && (userId || judgeId || officerId)) {
      loadUserData();
    }
  }, [open, userId, judgeId, officerId]);

  const loadUserData = async () => {
    setLoadingData(true);
    setError("");
    try {
      if (type === "user" && userId) {
        const data = await userApi.getUserById(userId);
        reset({
          fullName: data.fullName,
          email: data.email,
          username: data.username,
        });
      } else if (type === "judge" && userId) {
        const data = await userApi.getUserById(userId);
        reset({
          fullName: data.fullName,
          email: data.email,
          cnic: data.cnic || "",
          contactNo: data.contactNo || "",
          rank: data.rank || "",
        });
      } else if (type === "officer" && userId) {
        const data = await userApi.getUserById(userId);
        reset({
          fullName: data.fullName,
          email: data.email,
          cnic: data.cnic || "",
          contactNo: data.contactNo || "",
          badgeNumber: data.badgeNumber || "",
          rank: data.rank || "",
          isInvestigationOfficer: data.isInvestigationOfficer || false,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load user data");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (type === "user" && userId) {
        await userApi.updateUser(userId, data as UpdateUserDto);
        enqueueSnackbar("User updated successfully", { variant: "success" });
      } else if (type === "judge" && judgeId) {
        await userApi.updateJudge(judgeId, data as UpdateJudgeDto);
        enqueueSnackbar("Judge updated successfully", { variant: "success" });
      } else if (type === "officer" && officerId) {
        await userApi.updatePoliceOfficer(
          officerId,
          data as UpdatePoliceOfficerDto
        );
        enqueueSnackbar("Police Officer updated successfully", {
          variant: "success",
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || "Failed to update user", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Edit />
          Edit{" "}
          {type === "user" ? "User" : type === "judge" ? "Judge" : "Officer"}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loadingData && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loadingData && !error && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              {/* Full Name */}
              <Grid item xs={12}>
                <Controller
                  name="fullName"
                  control={control}
                  rules={{
                    required: validationMessages.required("Full name"),
                    minLength: {
                      value: 3,
                      message: validationMessages.minLength("Full name", 3),
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Full Name"
                      fullWidth
                      error={!!errors.fullName}
                      helperText={errors.fullName?.message}
                      required
                    />
                  )}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: validationMessages.required("Email"),
                    validate: (value: any) =>
                      validation.email(value) || validationMessages.email,
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="email"
                      label="Email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      required
                    />
                  )}
                />
              </Grid>

              {/* Username (only for user type) */}
              {type === "user" && (
                <Grid item xs={12}>
                  <Controller
                    name="username"
                    control={control}
                    rules={{
                      required: validationMessages.required("Username"),
                      validate: (value: any) =>
                        validation.username(value) ||
                        validationMessages.username,
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Username"
                        fullWidth
                        error={!!(errors as any).username}
                        helperText={(errors as any).username?.message}
                        required
                      />
                    )}
                  />
                </Grid>
              )}

              {/* CNIC (for judge and officer) */}
              {(type === "judge" || type === "officer") && (
                <Grid item xs={12} md={6}>
                  <Controller
                    name="cnic"
                    control={control}
                    rules={{
                      required: validationMessages.required("CNIC"),
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="CNIC"
                        placeholder="12345-1234567-1"
                        fullWidth
                        error={!!(errors as any).cnic}
                        helperText={(errors as any).cnic?.message}
                        required
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Contact Number (for judge and officer) */}
              {(type === "judge" || type === "officer") && (
                <Grid item xs={12} md={6}>
                  <Controller
                    name="contactNo"
                    control={control}
                    rules={{
                      required: validationMessages.required("Contact number"),
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Contact Number"
                        placeholder="+92-300-1234567"
                        fullWidth
                        error={!!(errors as any).contactNo}
                        helperText={(errors as any).contactNo?.message}
                        required
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Badge Number (for officer only) */}
              {type === "officer" && (
                <Grid item xs={12} md={6}>
                  <Controller
                    name="badgeNumber"
                    control={control}
                    rules={{
                      required: validationMessages.required("Badge number"),
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Badge Number"
                        fullWidth
                        error={!!(errors as any).badgeNumber}
                        helperText={(errors as any).badgeNumber?.message}
                        required
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Rank (for judge and officer) */}
              {(type === "judge" || type === "officer") && (
                <Grid item xs={12} md={type === "officer" ? 6 : 12}>
                  <Controller
                    name="rank"
                    control={control}
                    rules={{
                      required: validationMessages.required("Rank"),
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Rank"
                        fullWidth
                        error={!!(errors as any).rank}
                        helperText={(errors as any).rank?.message}
                        required
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Investigation Officer (for officer only) */}
              {type === "officer" && (
                <Grid item xs={12}>
                  <Controller
                    name="isInvestigationOfficer"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value as boolean}
                            onChange={field.onChange}
                          />
                        }
                        label="Investigation Officer"
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Info Alert */}
              <Grid item xs={12}>
                <Alert severity="info">
                  {type === "user" && (
                    <>
                      Only basic information can be updated for Admin, Court
                      Authority, and Station Authority users.
                    </>
                  )}
                  {type === "judge" && (
                    <>
                      Court assignment cannot be changed here. Contact Court
                      Authority to reassign judge.
                    </>
                  )}
                  {type === "officer" && (
                    <>
                      Station assignment cannot be changed here. Contact Station
                      Authority to transfer officer.
                    </>
                  )}
                </Alert>
              </Grid>
            </Grid>
          </form>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading || loadingData}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
