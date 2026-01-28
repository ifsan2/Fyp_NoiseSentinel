import { SnackbarProvider, closeSnackbar } from "notistack";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppRouter } from "@/routes/AppRouter";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        autoHideDuration={5000}
        action={(snackbarId) => (
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => closeSnackbar(snackbarId)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      >
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
