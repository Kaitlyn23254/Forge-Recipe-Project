import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import "../styles/Recipes.css";

const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

const FILTER_OPTIONS = [
  { label: "Main ingredient", value: "ingredient" },
  { label: "Category", value: "category" },
  { label: "Area", value: "area" },
];

// Categories given by API
const CATEGORY_OPTIONS = [
  "Beef",
  "Chicken",
  "Dessert",
  "Lamb",
  "Miscellaneous",
  "Pasta",
  "Pork",
  "Seafood",
  "Side",
  "Starter",
  "Vegan",
  "Vegetarian",
  "Breakfast",
  "Goat",
];

// Consistent formatting for recipe data
function parseMealIngredients(meal) {
  const ingredients = [];

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim();
    const measurement = meal[`strMeasure${index}`]?.trim();

    if (ingredient) {
      ingredients.push({
        ingredient,
        measurement: measurement || "",
      });
    }
  }

  return ingredients;
}

function parseMealTags(meal) {
  return meal.strTags
    ? meal.strTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
}

function buildMealSummary(meal) {
  const ingredients = parseMealIngredients(meal);

  // Grab snippet of instructions for description
  const instructionExcerpt = meal.strInstructions
    ? meal.strInstructions.replace(/\s+/g, " ").trim().slice(0, 140)
    : "No instructions available.";

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    source: meal.strCategory || "MealDB",
    category: meal.strCategory || "",
    description:
      ingredients.length > 0
        ? `${instructionExcerpt}${meal.strInstructions?.length > 140 ? "..." : ""}`
        : instructionExcerpt,
    image: meal.strMealThumb,
    area: meal.strArea,
    ingredients,
    instructions: meal.strInstructions || "No instructions available.",
    tags: parseMealTags(meal),
    youtube: meal.strYoutube || "",
    sourceUrl: meal.strSource || "",
  };
}

export default function Recipes() {
  const navigate = useNavigate();
  const [recipeCollection, setRecipeCollection] = useState("official");
  const [searchText, setSearchText] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState("ingredient");
  const [filterValue, setFilterValue] = useState("");
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedRecipeOpen, setSelectedRecipeOpen] = useState(false);
  const [selectedRecipeLoading, setSelectedRecipeLoading] = useState(false);
  const [selectedRecipeError, setSelectedRecipeError] = useState("");
  const selectedRecipeAbortRef = useRef(null);

  useEffect(() => {
    const abortController = new AbortController();
    const searchTerm = searchText.trim();

    if (recipeCollection === "community") {
      setLoading(false);
      setError("");
      setRecipes([]);
      return undefined;
    }

    // Delay loading to avoid making too many requests while user is typing or changing filters
    async function loadRecipes() {
      setLoading(true);
      setError("");

      const hasActiveFilter = Boolean(activeFilter?.type && activeFilter?.value);
      const filterParam = activeFilter?.type === "ingredient" ? "i" : activeFilter?.type === "category" ? "c" : "a";
      const endpoint = hasActiveFilter
        ? `${API_BASE_URL}/filter.php?${filterParam}=${encodeURIComponent(activeFilter.value)}`
        : searchTerm
          ? `${API_BASE_URL}/search.php?s=${encodeURIComponent(searchTerm)}`
          : `${API_BASE_URL}/search.php?f=a`;

      try {
        const response = await fetch(endpoint, { signal: abortController.signal });

        if (!response.ok) {
          throw new Error("MealDB request failed.");
        }

        const data = await response.json();
        let nextRecipes = Array.isArray(data.meals) ? data.meals : [];

        if (hasActiveFilter && nextRecipes.length > 0) {
          const detailedMeals = await Promise.all(
            nextRecipes.map(async (meal) => {
              const detailResponse = await fetch(
                `${API_BASE_URL}/lookup.php?i=${encodeURIComponent(meal.idMeal)}`,
                {
                  signal: abortController.signal,
                },
              );

              if (!detailResponse.ok) {
                return meal;
              }

              const detailData = await detailResponse.json();
              return detailData.meals?.[0] ?? meal;
            }),
          );

          nextRecipes = detailedMeals;
        }

        nextRecipes = nextRecipes
          .map(buildMealSummary)
          .filter((card) => {
            if (searchTerm.length === 0) {
              return true;
            }

            const normalizedSearch = searchTerm.toLowerCase();
            return (
              card.title.toLowerCase().includes(normalizedSearch) ||
              card.description.toLowerCase().includes(normalizedSearch) ||
              card.ingredients.some((ingredient) =>
                [ingredient.measurement, ingredient.ingredient]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase()
                  .includes(normalizedSearch),
              )
            );
          });

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
  }, [activeFilter, recipeCollection, searchText]);

  // Load list of main ingredients and areas for the dropdowns
  useEffect(() => {
    const ac = new AbortController();

    async function loadLists() {
      try {
        const [ingsRes, areasRes] = await Promise.all([
          fetch(`${API_BASE_URL}/list.php?i=list`, { signal: ac.signal }),
          fetch(`${API_BASE_URL}/list.php?a=list`, { signal: ac.signal }),
        ]);

        if (ingsRes.ok) {
          const data = await ingsRes.json();
          if (Array.isArray(data.meals)) {
            const names = data.meals.map((m) => m.strIngredient).filter(Boolean);
            setIngredientOptions(names);
          }
        }

        if (areasRes.ok) {
          const data = await areasRes.json();
          if (Array.isArray(data.meals)) {
            const names = data.meals.map((m) => m.strArea).filter(Boolean);
            setAreaOptions(names);
          }
        }
      } catch (e) {
        // ignore
      }
    }

    loadLists();
    return () => ac.abort();
  }, []);

  const filterSummary = activeFilter
    ? `${activeFilter.type === "ingredient" ? "Ingredient" : activeFilter.type === "category" ? "Category" : "Area"}: ${activeFilter.value}`
    : "";

  function openFilterDialog() {
    if (recipeCollection === "community") {
      return;
    }

    setFilterDialogOpen(true);
  }

  function applyFilter() {
    const value = filterValue.trim();

    if (value.length === 0) {
      return;
    }

    setActiveFilter({ type: filterType, value });
    setFilterDialogOpen(false);
  }

  function clearFilter() {
    setActiveFilter(null);
    setFilterValue("");
    setFilterType("ingredient");
    setFilterDialogOpen(false);
  }

  // Load full recipe details when a card is clicked
  async function openRecipeDetails(recipe) {
    if (selectedRecipeAbortRef.current) {
      selectedRecipeAbortRef.current.abort();
    }

    const abortController = new AbortController();
    selectedRecipeAbortRef.current = abortController;

    setSelectedRecipe(recipe);
    setSelectedRecipeError("");
    setSelectedRecipeOpen(true);
    setSelectedRecipeLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/lookup.php?i=${encodeURIComponent(recipe.id)}`,
        {
          signal: abortController.signal,
        },
      );

      if (!response.ok) {
        throw new Error("MealDB lookup failed.");
      }

      const data = await response.json();
      const detailedMeal = data.meals?.[0];

      if (detailedMeal) {
        setSelectedRecipe(buildMealSummary(detailedMeal));
      }
    } catch (fetchError) {
      if (fetchError.name !== "AbortError") {
        setSelectedRecipeError("We could not load the full recipe details right now.");
      }
    } finally {
      if (!abortController.signal.aborted) {
        setSelectedRecipeLoading(false);
      }
    }
  }

  function closeRecipeDetails() {
    if (selectedRecipeAbortRef.current) {
      selectedRecipeAbortRef.current.abort();
      selectedRecipeAbortRef.current = null;
    }

    setSelectedRecipeOpen(false);
    setSelectedRecipeLoading(false);
    setSelectedRecipeError("");
  }

  function viewFullRecipe() {
    if (!selectedRecipe?.id) return;

    const source =
      recipeCollection === "community" ? "community" : "official";
    closeRecipeDetails();
    navigate(`/recipes/${selectedRecipe.id}?source=${source}`);
  }

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
            placeholder="Search recipes by name"
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
            onClick={openFilterDialog}
            disabled={recipeCollection === "community"}
          >
            {activeFilter ? "Edit filter" : "Filter"}
          </Button>
        </Box>

        {activeFilter ? (
          <Box className="recipes-page__filter-summary">
            <Chip label={filterSummary} className="recipes-page__active-filter-chip" />
            <Button variant="text" className="recipes-page__clear-filter-button" onClick={clearFilter}>
              Clear filter
            </Button>
          </Box>
        ) : null}

        <Dialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Filter recipes</DialogTitle>
          <DialogContent className="recipes-page__filter-dialog-content">
            <Typography variant="body2" className="recipes-page__filter-dialog-copy">
              Filter by category, main ingredient, or location.
            </Typography>
            <Select
              fullWidth
              value={filterType}
              onChange={(event) => {
                setFilterType(event.target.value);
                setFilterValue("");
              }}
              className="recipes-page__filter-select"
            >
              {FILTER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {filterType === "category" ? (
              <Select
                fullWidth
                displayEmpty
                value={filterValue}
                onChange={(event) => setFilterValue(event.target.value)}
                className="recipes-page__filter-select"
              >
                <MenuItem value="" disabled>
                  Select a category
                </MenuItem>
                {CATEGORY_OPTIONS.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            ) : filterType === "area" ? (
              <Select
                fullWidth
                displayEmpty
                value={filterValue}
                onChange={(event) => setFilterValue(event.target.value)}
                className="recipes-page__filter-select"
              >
                <MenuItem value="" disabled>
                  Select an area
                </MenuItem>
                {areaOptions.length === 0 ? (
                  <MenuItem value="">Loading…</MenuItem>
                ) : (
                  areaOptions.map((area) => (
                    <MenuItem key={area} value={area}>
                      {area}
                    </MenuItem>
                  ))
                )}
              </Select>
            ) : (
              <Select
                fullWidth
                displayEmpty
                value={filterValue}
                onChange={(event) => setFilterValue(event.target.value)}
                className="recipes-page__filter-select"
              >
                <MenuItem value="" disabled>
                  Select a main ingredient
                </MenuItem>
                {ingredientOptions.length === 0 ? (
                  <MenuItem value="">Loading…</MenuItem>
                ) : (
                  ingredientOptions.map((ingredient) => (
                    <MenuItem key={ingredient} value={ingredient}>
                      {ingredient}
                    </MenuItem>
                  ))
                )}
              </Select>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
            <Button onClick={clearFilter} disabled={!activeFilter && !filterValue && !filterDialogOpen}>
              Reset
            </Button>
            <Button variant="contained" onClick={applyFilter}>
              Apply
            </Button>
          </DialogActions>
        </Dialog>
        {/* Cards for displaying full recipe details */}
        <Dialog
          open={selectedRecipeOpen}
          onClose={closeRecipeDetails}
          fullWidth
          maxWidth="md"
          scroll="paper"
          className="recipes-page__recipe-dialog"
        >
          <DialogTitle className="recipes-page__recipe-dialog-title" component="div">
            <Box className="recipes-page__recipe-dialog-header">
              <Typography variant="h6" component="span" className="recipes-page__recipe-dialog-header-title">
                {selectedRecipe?.title || "Recipe details"}
              </Typography>
              <Button
                variant="contained"
                className="recipes-page__view-recipe-button"
                onClick={viewFullRecipe}
                disabled={selectedRecipeLoading || !selectedRecipe?.id}
              >
                View Recipe
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent className="recipes-page__recipe-dialog-content">
            {selectedRecipeLoading ? (
              <Box className="recipes-page__recipe-dialog-state">
                <CircularProgress size={34} />
                <Typography variant="body2" className="recipes-page__recipe-dialog-state-text">
                  Loading recipe details...
                </Typography>
              </Box>
            ) : selectedRecipe ? (
              <Box className="recipes-page__recipe-dialog-layout">
                <Box className="recipes-page__recipe-dialog-hero">
                  <Box
                    component="img"
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    className="recipes-page__recipe-dialog-image"
                  />

                  <Box className="recipes-page__recipe-dialog-meta">
                    <Box className="recipes-page__recipe-dialog-chip-row">
                      {selectedRecipe.source ? (
                        <Chip label={selectedRecipe.source} className="recipes-page__recipe-dialog-chip" />
                      ) : null}
                      {selectedRecipe.area ? (
                        <Chip label={selectedRecipe.area} className="recipes-page__recipe-dialog-chip" />
                      ) : null}
                      {selectedRecipe.category ? (
                        <Chip label={selectedRecipe.category} className="recipes-page__recipe-dialog-chip" />
                      ) : null}
                    </Box>

                    {selectedRecipe.tags.length > 0 ? (
                      <Box className="recipes-page__recipe-dialog-chip-row">
                        {selectedRecipe.tags.map((tag) => (
                          <Chip key={tag} label={tag} variant="outlined" className="recipes-page__recipe-dialog-tag" />
                        ))}
                      </Box>
                    ) : null}
                  </Box>
                </Box>

                <Box className="recipes-page__recipe-dialog-grid">
                  <Box className="recipes-page__recipe-dialog-panel">
                    <Typography variant="h5" component="h3" className="recipes-page__recipe-dialog-panel-title">
                      Ingredients
                    </Typography>
                    <Box className="recipes-page__recipe-dialog-ingredients">
                      {selectedRecipe.ingredients.map((ingredient) => (
                        <Box key={`${ingredient.ingredient}-${ingredient.measurement}`} className="recipes-page__recipe-dialog-ingredient-row">
                          <Typography variant="body2" className="recipes-page__recipe-dialog-measurement">
                            {ingredient.measurement || "-"}
                          </Typography>
                          <Typography variant="body2" className="recipes-page__recipe-dialog-ingredient">
                            {ingredient.ingredient}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box className="recipes-page__recipe-dialog-panel recipes-page__recipe-dialog-panel--wide">
                    <Typography variant="h5" component="h3" className="recipes-page__recipe-dialog-panel-title">
                      Instructions
                    </Typography>
                    <Typography variant="body1" className="recipes-page__recipe-dialog-instructions">
                      {selectedRecipe.instructions}
                    </Typography>

                    {selectedRecipe.youtube || selectedRecipe.sourceUrl ? (
                      <Box className="recipes-page__recipe-dialog-links">
                        {selectedRecipe.youtube ? (
                          <Button
                            component="a"
                            href={selectedRecipe.youtube}
                            target="_blank"
                            rel="noreferrer"
                            variant="outlined"
                          >
                            Watch video
                          </Button>
                        ) : null}
                        {selectedRecipe.sourceUrl ? (
                          <Button
                            component="a"
                            href={selectedRecipe.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            variant="outlined"
                          >
                            Recipe source
                          </Button>
                        ) : null}
                      </Box>
                    ) : null}
                  </Box>
                </Box>

                {selectedRecipeError ? (
                  <Typography variant="body2" className="recipes-page__recipe-dialog-error">
                    {selectedRecipeError}
                  </Typography>
                ) : null}
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeRecipeDetails}>Close</Button>
          </DialogActions>
        </Dialog>

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
                <CardActionArea className="recipes-page__card-action" onClick={() => openRecipeDetails(card)}>
                  <CardContent className="recipes-page__card-content">
                    <Box
                      component="img"
                      src={card.image}
                      alt={card.title}
                      className="recipes-page__card-image"
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
