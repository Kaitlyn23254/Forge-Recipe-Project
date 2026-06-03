import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import RestaurantIcon from "@mui/icons-material/Restaurant";

function Navbar() {
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
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              sx={{
                backgroundColor: "#F2D8A7",
                color: "#1F1F1F",
                fontWeight: "bold",
                px: 4,
                "&:hover": { backgroundColor: "#E8C98F" },
              }}
            >
              Login
            </Button>
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