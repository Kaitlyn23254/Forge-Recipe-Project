import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import { useState } from "react";
import "../styles/Recipes.css";

const placeholderCards = [
  {
    title: " Pasta",
    source: "Official",
    description: "placeholder",
  },
  {
    title: "Bowls",
    source: "Community",
    description: "Placeholder",
  },
];

export default function Recipes() {
  const [recipeSource, setRecipeSource] = useState("official");
  const [searchText, setSearchText] = useState("");
  const normalizedSearch = searchText.trim().toLowerCase();
  const visibleCards = placeholderCards.filter((card) => {
    const matchesSource = card.source.toLowerCase() === recipeSource;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      card.title.toLowerCase().includes(normalizedSearch) ||
      card.description.toLowerCase().includes(normalizedSearch);

    return matchesSource && matchesSearch;
  });

  return (
    <Box className="recipes-page">
      <Box className="recipes-page__inner">
        <Box className="recipes-page__header">
          <Typography variant="h3" component="h1" className="recipes-page__title">
            Recipes
          </Typography>
          <Typography variant="subtitle1" className="recipes-page__subtitle">
            Browse official and community recipes
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
            value={recipeSource}
            exclusive
            onChange={(_, nextValue) => {
              if (nextValue !== null) {
                setRecipeSource(nextValue);
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

        <Box className="recipes-page__grid">
          {visibleCards.map((card) => (
            <Card key={card.title} elevation={0} className="recipes-page__card">
              <CardActionArea className="recipes-page__card-action">
                <CardContent className="recipes-page__card-content">
                  <Box className="recipes-page__card-image" />

                  <Box className="recipes-page__card-meta">
                    <Chip label={card.source} size="small" className="recipes-page__card-chip" />
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
      </Box>
    </Box>
  );
}
