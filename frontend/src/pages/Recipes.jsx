import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import { useEffect, useState } from "react";
import "../styles/Recipes.css";

const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// Consistent formatting for recipe data
function buildMealSummary(meal) {
  const ingredients = [];

  // Extract ingredients and measurements into a single list
  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim();
    const measurement = meal[`strMeasure${index}`]?.trim();

    if (ingredient) {
      ingredients.push([measurement, ingredient].filter(Boolean).join(" "));
    }
  }

  // Grab snippet of instructions for description
  const instructionExcerpt = meal.strInstructions
    ? meal.strInstructions.replace(/\s+/g, " ").trim().slice(0, 140)
    : "No instructions available.";

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    source: meal.strCategory || "MealDB",
    description:
      ingredients.length > 0
        ? `${instructionExcerpt}${meal.strInstructions?.length > 140 ? "..." : ""}`
        : instructionExcerpt,
    image: meal.strMealThumb,
    area: meal.strArea,
    ingredients,
  };
}

export default function Recipes() {
  const [recipeCollection, setRecipeCollection] = useState("official");
  const [searchText, setSearchText] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const abortController = new AbortController();
    const searchTerm = searchText.trim();

    if (recipeCollection === "community") {
      setLoading(false);
      setError("");
      setRecipes([]);
      return undefined;
    }

    async function loadRecipes() {
      setLoading(true);
      setError("");

      const endpoint = searchTerm
        ? `${API_BASE_URL}/search.php?s=${encodeURIComponent(searchTerm)}`
        : `${API_BASE_URL}/search.php?f=a`;

      try {
        const response = await fetch(endpoint, { signal: abortController.signal });

        if (!response.ok) {
          throw new Error("MealDB request failed.");
        }

        const data = await response.json();
        const nextRecipes = Array.isArray(data.meals) ? data.meals.map(buildMealSummary) : [];

        setRecipes(nextRecipes);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setRecipes([]);
          setError("We could not load recipes from MealDB right now.");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    const loadTimer = window.setTimeout(loadRecipes, 250);

    return () => {
      window.clearTimeout(loadTimer);
      abortController.abort();
    };
  }, [recipeCollection, searchText]);

  return (
    <Box className="recipes-page">
      <Box className="recipes-page__inner">
        <Box className="recipes-page__header">
          <Typography variant="h3" component="h1" className="recipes-page__title">
            Recipes
          </Typography>
          <Typography variant="subtitle1" className="recipes-page__subtitle">
            Browse official recipes from TheMealDB and community uploads.
          </Typography>
        </Box>

        <Box className="recipes-page__controls">
          <TextField
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search recipes"
            fullWidth
            className="recipes-page__search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="recipes-page__search-icon" />
                </InputAdornment>
              ),
            }}
          />

          <ToggleButtonGroup
            value={recipeCollection}
            exclusive
            onChange={(_, nextValue) => {
              if (nextValue !== null) {
                setRecipeCollection(nextValue);
              }
            }}
            className="recipes-page__toggle-group"
          >
            <ToggleButton value="official" className="recipes-page__toggle-button">
              Official
            </ToggleButton>
            <ToggleButton value="community" className="recipes-page__toggle-button">
              Community
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            startIcon={<TuneIcon />}
            className="recipes-page__filter-button"
          >
            Filter
          </Button>
        </Box>

        {recipeCollection === "community" ? (
          <Box className="recipes-page__state">
            <Typography variant="body1" className="recipes-page__state-text">
              Community recipes will appear here once users upload their own recipes.
            </Typography>
          </Box>
        ) : loading ? (
          <Box className="recipes-page__state">
            <CircularProgress size={36} />
            <Typography variant="body1" className="recipes-page__state-text">
              Loading recipes...
            </Typography>
          </Box>
        ) : error ? (
          <Box className="recipes-page__state">
            <Typography variant="body1" className="recipes-page__state-text">
              {error}
            </Typography>
          </Box>
        ) : recipes.length === 0 ? (
          <Box className="recipes-page__state">
            <Typography variant="body1" className="recipes-page__state-text">
              No recipes matched your search.
            </Typography>
          </Box>
        ) : (
          <Box className="recipes-page__grid">
            {recipes.map((card) => (
              <Card key={card.id} elevation={0} className="recipes-page__card">
                <CardActionArea className="recipes-page__card-action">
                  <CardContent className="recipes-page__card-content">
                    <Box
                      className="recipes-page__card-image"
                      sx={{ backgroundImage: `url(${card.image})` }}
                    />

                    <Box className="recipes-page__card-meta">
                      <Chip label={card.source} size="small" className="recipes-page__card-chip" />
                      {card.area ? (
                        <Chip label={card.area} size="small" className="recipes-page__card-chip" />
                      ) : null}
                    </Box>

                    <Box className="recipes-page__card-body">
                      <Typography variant="h6" component="h2" className="recipes-page__card-title">
                        {card.title}
                      </Typography>
                      <Typography variant="body2" className="recipes-page__card-description">
                        {card.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
