import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { API_BASE_URL } from "../utility/api.js";
import { setStoredUser } from "../utility/auth.js";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const isSignup = mode === "signup";

  useEffect(() => {
    setMessage("");
  }, [mode]);

  const pageCopy = useMemo(
    () => ({
      login: {
        title: "Welcome back",
        subtitle: "Sign in to save recipes, post comments, and use your account.",
        button: "Log In",
      },
      signup: {
        title: "Create your account",
        subtitle: "Set up your CookIt profile and choose whether this account is a user or admin.",
        button: "Create Account",
      },
    }),
    [],
  );

  const currentCopy = pageCopy[mode];

  function handleModeChange(event, nextMode) {
    if (nextMode) {
      setMode(nextMode);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = isSignup ? "/users/register" : "/users/login";
      const payload = isSignup
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }
        : {
            email: formData.email,
            password: formData.password,
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setStoredUser(data);
      setMessageType("success");
      setMessage(
        isSignup
          ? "Account created. You are signed in now."
          : "Login successful. You are signed in now.",
      );
      navigate("/");
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 8,
        background:
          "radial-gradient(circle at top left, rgba(31, 111, 120, 0.18), transparent 34%), linear-gradient(180deg, #F7F3EA 0%, #EFE4D0 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 5,
            overflow: "hidden",
            boxShadow: "0 28px 80px rgba(31, 31, 31, 0.18)",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #1F6F78 0%, #13464C 100%)",
              color: "white",
              px: { xs: 3, sm: 4 },
              py: 4,
            }}
          >
            <Typography variant="overline" sx={{ letterSpacing: 3, opacity: 0.8 }}>
              CookIt Access
            </Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
              {currentCopy.title}
            </Typography>
            <Typography sx={{ mt: 1.5, maxWidth: 520, color: "rgba(255,255,255,0.88)" }}>
              {currentCopy.subtitle}
            </Typography>
          </Box>

          <CardContent sx={{ px: { xs: 3, sm: 4 }, py: 4 }}>
            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={handleModeChange}
                fullWidth
                sx={{
                  "& .MuiToggleButton-root": {
                    py: 1.2,
                    fontWeight: 700,
                    textTransform: "none",
                  },
                }}
              >
                <ToggleButton value="login">Log In</ToggleButton>
                <ToggleButton value="signup">Create Account</ToggleButton>
              </ToggleButtonGroup>

              {message ? <Alert severity={messageType}>{message}</Alert> : null}

              {isSignup ? (
                <TextField
                  name="name"
                  label="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              ) : null}

              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />

              <TextField
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
              />

              {isSignup ? (
                <TextField
                  select
                  name="role"
                  label="Role"
                  value={formData.role}
                  onChange={handleChange}
                  helperText="Admins can be assigned during account creation."
                  fullWidth
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </TextField>
              ) : null}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.4,
                  fontWeight: 700,
                  backgroundColor: "#1F6F78",
                  "&:hover": { backgroundColor: "#195B62" },
                }}
              >
                {loading ? "Please wait..." : currentCopy.button}
              </Button>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {isSignup ? "Already have an account?" : "Need an account?"}
                </Typography>
                <Button
                  type="button"
                  variant="text"
                  onClick={() => setMode(isSignup ? "login" : "signup")}
                  sx={{ p: 0, minWidth: 0, textTransform: "none", fontWeight: 700 }}
                >
                  {isSignup ? "Switch to log in" : "Create one now"}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Login;
