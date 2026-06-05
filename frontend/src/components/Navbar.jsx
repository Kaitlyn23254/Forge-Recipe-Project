import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { AUTH_CHANGE_EVENT, clearStoredUser, getStoredUser } from "../utility/auth.js";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const [anchorEl, setAnchorEl] = useState(null);

  const menuOpen = Boolean(anchorEl);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    function handleAuthChange() {
      setUser(getStoredUser());
    }

    function handleStorageChange(event) {
      if (event.key === "cookit-user") {
        handleAuthChange();
      }
    }

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  function handleAccountClick(event) {
    if (!user) {
      navigate("/login");
      return;
    }

    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleLogout() {
    clearStoredUser();
    handleMenuClose();
    navigate("/");
  }

  const accountLabel = user?.name || user?.email?.split("@")[0] || "Account";

  return (
    <Box sx={{ backgroundColor: "#1F6F78", color: "white", py: 2 }}>
      <Container maxWidth={false} sx={{ px: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 1fr",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <RestaurantIcon sx={{ fontSize: 34 }} />
            <Typography
              component={Link}
              to="/"
              variant="h4"
              fontWeight="bold"
              sx={{
                color: "white",
                textDecoration: "none",
              }}
            >
              CookIt
            </Typography>
          </Stack>

          <Stack direction="row" spacing={8} justifyContent="center">
            <Typography component={Link} to="/" sx={navLink}>
              Home
            </Typography>
            <Typography component={Link} to="/recipes" sx={navLink}>
              Recipes
            </Typography>
            <Typography component={Link} to="/my-recipes" sx={navLink}>
              My Recipes
            </Typography>
            <Typography component={Link} to="/create-recipe" sx={navLink}>
              Create Recipe
            </Typography>
            {isAdmin ? (
              <Typography component={Link} to="/admin" sx={navLink}>
                Admin
              </Typography>
            ) : null}
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={handleAccountClick}
              variant="contained"
              aria-controls={menuOpen ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? "true" : undefined}
              sx={{
                backgroundColor: "#F2D8A7",
                color: "#1F1F1F",
                fontWeight: "bold",
                px: 4,
                "&:hover": { backgroundColor: "#E8C98F" },
              }}
            >
              {user ? accountLabel : "Login"}
            </Button>
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

const navLink = {
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    color: "#F2D8A7",
    transform: "translateY(-1px)",
  },
};

export default Navbar;
