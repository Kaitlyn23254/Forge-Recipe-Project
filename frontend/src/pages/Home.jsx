import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import RestaurantIcon from "@mui/icons-material/Restaurant";

function Home() {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipes = [];

        for (let i = 0; i < 3; i++) {
          const response = await fetch(
            "https://www.themealdb.com/api/json/v1/1/random.php"
          );

          const data = await response.json();
          recipes.push(data.meals[0]);
        }

        setFeaturedRecipes(recipes);
      } catch (error) {
        console.error("Error fetching featured recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <Box sx={{ backgroundColor: "#F7F3EA", minHeight: "100vh" }}>
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
              <Typography variant="h4" fontWeight="bold">
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

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box
          sx={{
            display: "flex",
            gap: 5,
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box sx={{ flex: 1.3 }}>
            <Typography
              variant="h2"
              fontWeight="bold"
              sx={{ color: "#1F1F1F", lineHeight: 1.1, maxWidth: 680 }}
            >
              Find Your Next Favorite Recipe
            </Typography>

            <Typography
              variant="h6"
              sx={{ mt: 2, mb: 3, color: "#555", maxWidth: 650 }}
            >
              Discover official recipes, explore community creations, save your
              favorites, and get cooking help all in one place.
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <Button
                component={Link}
                to="/recipes"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: "#1F6F78",
                  fontWeight: "bold",
                  px: 4,
                  py: 1.4,
                  "&:hover": { backgroundColor: "#195B62" },
                }}
              >
                Browse Recipes
              </Button>

              <Button
                component={Link}
                to="/create-recipe"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "#1F6F78",
                  color: "#1F6F78",
                  fontWeight: "bold",
                  px: 4,
                  py: 1.4,
                }}
              >
                Create Recipe
              </Button>
            </Stack>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <MiniStat number="500+" label="Recipes" />
              <MiniStat number="4.8★" label="Avg Rating" />
              <MiniStat number="AI" label="Cooking Help" />
            </Stack>
          </Box>

          <Card
            sx={{
              flex: 0.9,
              width: "100%",
              backgroundColor: "#F2D8A7",
              borderRadius: 5,
              p: 3,
              boxShadow: 4,
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Featured Recipes
            </Typography>

            <Stack spacing={2}>
              {featuredRecipes.map((recipe) => (
                <RecipePreview
                  key={recipe.idMeal}
                  title={recipe.strMeal}
                  image={recipe.strMealThumb}
                />
              ))}
            </Stack>
          </Card>
        </Box>
      </Container>

      <Box sx={{ backgroundColor: "#EFE4D0", py: 5 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight="bold" textAlign="center">
            Why CookIt?
          </Typography>

          <Typography textAlign="center" sx={{ color: "#555", mb: 4 }}>
            A simple way to find, save, and share recipes.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <FeatureCard
              icon={<SearchIcon sx={{ fontSize: 44, color: "#1F6F78" }} />}
              title="Search Recipes"
              text="Browse official and community-created recipes."
            />

            <FeatureCard
              icon={<FavoriteIcon sx={{ fontSize: 44, color: "#1F6F78" }} />}
              title="Save Favorites"
              text="Keep your favorite meals saved for later."
            />

            <FeatureCard
              icon={<SmartToyIcon sx={{ fontSize: 44, color: "#1F6F78" }} />}
              title="AI Assistant"
              text="Get recipe help, substitutions, and cooking tips."
            />
          </Box>
        </Container>
      </Box>

      <Box sx={{ backgroundColor: "#1F6F78", color: "white", py: 4 }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Ready to start cooking?
              </Typography>
              <Typography>Explore recipes or create your own today.</Typography>
            </Box>

            <Button
              component={Link}
              to="/recipes"
              variant="contained"
              sx={{
                backgroundColor: "#F2D8A7",
                color: "#1F1F1F",
                fontWeight: "bold",
                px: 4,
                "&:hover": { backgroundColor: "#E8C98F" },
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Container>
      </Box>
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

function RecipePreview({ title, image }) {
  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: 3,
        p: 2,
        display: "flex",
        gap: 2,
        alignItems: "center",
      }}
    >
      <img
        src={image}
        alt={title}
        style={{
          width: 70,
          height: 70,
          borderRadius: 8,
          objectFit: "cover",
        }}
      />

      <Box sx={{ flexGrow: 1 }}>
        <Typography fontWeight="bold">{title}</Typography>
      </Box>

      <Button
        component={Link}
        to="/recipes"
        size="small"
        sx={{ color: "#1F6F78", fontWeight: "bold" }}
      >
        View
      </Button>
    </Box>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <Card sx={{ flex: 1, borderRadius: 4 }}>
      <CardContent sx={{ textAlign: "center", p: 4 }}>
        {icon}
        <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">{text}</Typography>
      </CardContent>
    </Card>
  );
}

function MiniStat({ number, label }) {
  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: 3,
        px: 3,
        py: 2,
        minWidth: 120,
        boxShadow: 1,
      }}
    >
      <Typography variant="h6" fontWeight="bold" color="#1F6F78">
        {number}
      </Typography>
      <Typography fontSize={14} color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

export default Home;