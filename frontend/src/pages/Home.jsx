import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import RestaurantIcon from "@mui/icons-material/Restaurant";

function Home() {
  return (
    <Box sx={{ backgroundColor: "#F7F3EA", minHeight: "100vh" }}>
      {/* Navbar */}
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

            <Stack direction="row" spacing={6} justifyContent="center">
              <Typography fontWeight="bold">Home</Typography>
              <Typography fontWeight="bold">Recipes</Typography>
              <Typography fontWeight="bold">My Recipes</Typography>
              <Typography fontWeight="bold">Create Recipe</Typography>
            </Stack>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
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

      {/* Hero Section */}
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
              <RecipePreview title="Creamy Garlic Pasta" time="25 min" />
              <RecipePreview title="Fresh Garden Salad" time="15 min" />
              <RecipePreview title="Chicken Rice Bowl" time="30 min" />
            </Stack>
          </Card>
        </Box>
      </Container>

      {/* Features Section */}
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

      {/* Bottom CTA */}
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

function RecipePreview({ title, time }) {
  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: 3,
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box>
        <Typography fontWeight="bold">{title}</Typography>
        <Typography fontSize={14} color="text.secondary">
          {time} • ⭐⭐⭐⭐⭐
        </Typography>
      </Box>

      <Button size="small" sx={{ color: "#1F6F78", fontWeight: "bold" }}>
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