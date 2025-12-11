import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  ArrowBack,
  Save,
  Description,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { JUDGE_ROUTES } from "@/utils/judgeConstants";
import { STATEMENT_TYPES } from "@/utils/judgeConstants";
import { useAuth } from "@/contexts/AuthContext";
import caseApi from "@/api/caseApi";
import caseStatementApi from "@/api/caseStatementApi";
import { CaseListItem } from "@/models/Case";
import { CreateCaseStatementDto } from "@/models/CaseStatement";

export const CreateCaseStatementPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedCaseId = searchParams.get("caseId");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myCases, setMyCases] = useState<CaseListItem[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseListItem | null>(null);
  const [formData, setFormData] = useState<CreateCaseStatementDto>({
    caseId: preselectedCaseId ? parseInt(preselectedCaseId) : 0,
    statementText: "",
    statementBy: user?.fullName || "",
  });
  const [statementType, setStatementType] = useState("");

  useEffect(() => {
    loadMyCases();
  }, []);

  useEffect(() => {
    if (formData.caseId && myCases.length > 0) {
      const caseItem = myCases.find((c) => c.caseId === formData.caseId);
      setSelectedCase(caseItem || null);
    }
  }, [formData.caseId, myCases]);

  const loadMyCases = async () => {
    setLoading(true);
    try {
      const data = await caseApi.getMyCases();
      setMyCases(data);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load cases",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatementTemplate = (type: string): string => {
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    switch (type) {
      case "Hearing Proceeding":
        return `Hearing conducted on ${today}.\n\nACCUSED PRESENT: [Yes/No]\nCOUNSEL PRESENT: [Yes/No]\n\nEVIDENCE PRESENTED:\n- [List evidence items]\n\nARGUMENTS:\nProsecution: [Summary]\nDefense: [Summary]\n\nOBSERVATIONS:\n[Judge's observations]\n\nNEXT ACTION:\nCase adjourned to [date] for [reason].`;
      
      case "Interim Order":
        return `INTERIM ORDER\n\nDate: ${today}\n\nORDER:\n[Specific order or direction]\n\nREASON:\n[Justification for the order]\n\nEFFECTIVE DATE: [Date]\nVALID UNTIL: [Date or event]`;
      
      case "Final Verdict":
        return `FINAL VERDICT\n\nDate: ${today}\n\nCASE SUMMARY:\n[Brief case summary]\n\nFINDINGS:\nAfter reviewing all evidence and arguments, this court finds:\n[Detailed findings]\n\nVERDICT:\nThe accused is hereby found [GUILTY/NOT GUILTY] of [charges].\n\nSENTENCE/ORDER:\n[Penalty, fine, or dismissal details]\n\nREASONING:\n[Legal reasoning and precedents]\n\nThis verdict is final and binding.`;
      
      case "Evidence Review":
        return `EVIDENCE REVIEW\n\nDate: ${today}\n\nEVIDENCE EXAMINED:\n1. [Evidence item]\n   - Source: [Source]\n   - Authenticity: [Verified/Unverified]\n   - Relevance: [High/Medium/Low]\n\nANALYSIS:\n[Detailed analysis of evidence]\n\nCONCLUSION:\n[Conclusion about evidence admissibility and weight]`;
      
      case "Case Summary":
        return `CASE SUMMARY\n\nDate: ${today}\n\nBACKGROUND:\n[Case background]\n\nKEY FACTS:\n- [Fact 1]\n- [Fact 2]\n\nLEGAL ISSUES:\n[Legal questions to be resolved]\n\nSTATUS:\n[Current case status and next steps]`;
      
      default:
        return "";
    }
  };

  const handleStatementTypeChange = (type: string) => {
    setStatementType(type);
    const template = getStatementTemplate(type);
    setFormData({ ...formData, statementText: template });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.caseId) {
      enqueueSnackbar("Please select a case", { variant: "error" });
      return;
    }

    if (formData.statementText.length < 20) {
      enqueueSnackbar("Statement must be at least 20 characters", { variant: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await caseStatementApi.createCaseStatement(formData);
      enqueueSnackbar("Case statement recorded successfully", { variant: "success" });
      navigate(JUDGE_ROUTES.CASE_STATEMENTS);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to create statement",
        { variant: "error" }
      );
    } finally {
      setSubmitting(false);
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
        title="Record Case Statement"
        subtitle="Document hearing proceedings, observations, or verdict"
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(JUDGE_ROUTES.CASE_STATEMENTS)}
          >
            Back to Statements
          </Button>
        }
      />

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Select Case"
                value={formData.caseId}
                onChange={(e) =>
                  setFormData({ ...formData, caseId: parseInt(e.target.value) })
                }
                required
                disabled={!!preselectedCaseId}
              >
                <MenuItem value={0}>
                  <em>Select a case</em>
                </MenuItem>
                {myCases.map((caseItem) => (
                  <MenuItem key={caseItem.caseId} value={caseItem.caseId}>
                    {caseItem.caseNo} - {caseItem.caseType}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Statement Type (Template)"
                value={statementType}
                onChange={(e) => handleStatementTypeChange(e.target.value)}
                helperText="Select a type to load a template"
              >
                <MenuItem value="">
                  <em>Select template type</em>
                </MenuItem>
                {STATEMENT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {selectedCase && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: "info.50" }}>
                  <Typography variant="caption" color="text.secondary">
                    Selected Case Details
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Accused:</strong> {selectedCase.accusedName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Status:</strong>{" "}
                        <Chip label={selectedCase.caseStatus} size="small" />
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Statement By"
                value={formData.statementBy}
                onChange={(e) =>
                  setFormData({ ...formData, statementBy: e.target.value })
                }
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={15}
                label="Statement Text"
                value={formData.statementText}
                onChange={(e) =>
                  setFormData({ ...formData, statementText: e.target.value })
                }
                required
                placeholder="Enter detailed case statement, proceedings, observations, or verdict..."
                helperText={`${formData.statementText.length} / 5000 characters (minimum 20 required)`}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                <strong>Note:</strong> This statement will be recorded permanently in the case file
                and will be visible to court authorities.
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => navigate(JUDGE_ROUTES.CASE_STATEMENTS)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={submitting}
            >
              {submitting ? "Recording..." : "Record Statement"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
