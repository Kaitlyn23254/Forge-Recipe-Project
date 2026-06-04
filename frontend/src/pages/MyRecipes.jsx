import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import "../styles/MyRecipes.css";
import { getStoredUser } from "../utility/auth";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function MyRecipes() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("created");
  const [searchQuery, setSearchQuery] = useState("");
  const [createdRecipes, setCreatedRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [bookmarkedRecipeIds, setBookmarkedRecipeIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [menuAnchorElement, setMenuAnchorElement] = useState(null);
  const [menuTargetRecipeId, setMenuTargetRecipeId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recipeToDeleteId, setRecipeToDeleteId] = useState(null);

  const { uid: userId } = getStoredUser() ?? {};

  async function fetchCreatedRecipes() {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/recipes/user/${userId}`);
      setCreatedRecipes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching created recipes:", err);
      setCreatedRecipes([]);
    }
    setIsLoading(false);
  }

  async function fetchSavedRecipes() {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/users/${userId}/bookmarks`);
      setSavedRecipes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching saved recipes:", err);
      setSavedRecipes([]);
    }
    setIsLoading(false);
  }

  async function fetchBookmarkedIds() {
    try {
      const response = await axios.get(
        `${BASE_URL}/users/${userId}/bookmarks/ids`,
      );
      setBookmarkedRecipeIds(
        new Set(Array.isArray(response.data) ? response.data : []),
      );
    } catch (err) {
      console.error("Error fetching bookmarked ids:", err);
    }
  }

  useEffect(() => {
    fetchCreatedRecipes();
    fetchBookmarkedIds();
  }, []);

  function handleSelectCreatedTab() {
    setActiveTab("created");
  }

  function handleSelectSavedTab() {
    setActiveTab("saved");
    fetchSavedRecipes();
  }

  function handleSearchChange(event) {
    setSearchQuery(event.target.value);
  }

  function handleNavigateToCreate() {
    navigate("/create-recipe");
  }

  function handleCardClick(event) {
    const recipeId = event.currentTarget.dataset.recipeId;
    navigate(`/recipes/${recipeId}`);
  }

  async function handleBookmarkClick(event) {
    event.stopPropagation();
    const recipeId = event.currentTarget.dataset.recipeId;
    const isCurrentlyBookmarked = bookmarkedRecipeIds.has(recipeId);

    if (isCurrentlyBookmarked) {
      await axios.delete(`${BASE_URL}/users/${userId}/bookmarks/${recipeId}`);
      setBookmarkedRecipeIds((previousIds) => {
        const updatedIds = new Set(previousIds);
        updatedIds.delete(recipeId);
        return updatedIds;
      });
      if (activeTab === "saved") {
        setSavedRecipes((previousRecipes) =>
          previousRecipes.filter((savedRecipe) => savedRecipe.id !== recipeId),
        );
      }
    } else {
      await axios.post(`${BASE_URL}/users/${userId}/bookmarks/${recipeId}`);
      setBookmarkedRecipeIds(
        (previousIds) => new Set([...previousIds, recipeId]),
      );
    }
  }

  function handleOpenMenu(event) {
    event.stopPropagation();
    const recipeId = event.currentTarget.dataset.recipeId;
    setMenuAnchorElement(event.currentTarget);
    setMenuTargetRecipeId(recipeId);
  }

  function handleCloseMenu() {
    setMenuAnchorElement(null);
    setMenuTargetRecipeId(null);
  }

  function handleDeleteClick() {
    setRecipeToDeleteId(menuTargetRecipeId);
    handleCloseMenu();
    setDeleteConfirmOpen(true);
  }

  function handleDeleteCancel() {
    setDeleteConfirmOpen(false);
    setRecipeToDeleteId(null);
  }

  async function handleDeleteConfirm() {
    setDeleteConfirmOpen(false);
    await axios.delete(`${BASE_URL}/recipes/${recipeToDeleteId}`, {
      data: { userId: userId },
    });
    setCreatedRecipes((previousRecipes) =>
      previousRecipes.filter(
        (createdRecipe) => createdRecipe.id !== recipeToDeleteId,
      ),
    );
    setRecipeToDeleteId(null);
  }

  function handleEditRecipe() {
    const recipeId = menuTargetRecipeId;
    handleCloseMenu();
    navigate(`/create-recipe?edit=${recipeId}`);
  }

  function getDisplayedRecipes() {
    const recipeList = activeTab === "created" ? createdRecipes : savedRecipes;
    if (!Array.isArray(recipeList)) return [];
    if (!searchQuery.trim()) return recipeList;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return recipeList.filter((recipe) =>
      recipe.title.toLowerCase().includes(lowerCaseQuery),
    );
  }

  const displayedRecipes = getDisplayedRecipes();

  return (
    <div className="my-recipes-page">
      <div className="my-recipes-page__inner">
        <div className="my-recipes-page__header">
          <Typography variant="h4" className="my-recipes-page__title">
            My Recipes
          </Typography>
        </div>

        <div className="my-recipes-page__controls">
          <div className="my-recipes-page__chips">
            <Chip
              label="My Recipes"
              onClick={handleSelectCreatedTab}
              className={`my-recipes-page__chip ${activeTab === "created" ? "my-recipes-page__chip--active" : ""}`}
              variant="outlined"
            />
            <Chip
              label="Saved"
              onClick={handleSelectSavedTab}
              className={`my-recipes-page__chip ${activeTab === "saved" ? "my-recipes-page__chip--active" : ""}`}
              variant="outlined"
            />
          </div>

          <div className="my-recipes-page__search-wrap">
            <TextField
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              className="my-recipes-page__search"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="my-recipes-page__search-icon" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <IconButton
              className="my-recipes-page__add-btn"
              onClick={handleNavigateToCreate}
            >
              <AddIcon />
            </IconButton>
          </div>
        </div>

        {isLoading && (
          <div className="my-recipes-page__empty">
            <CircularProgress />
          </div>
        )}

        {!isLoading && displayedRecipes.length === 0 && (
          <div className="my-recipes-page__empty">
            <Typography variant="body1">
              {activeTab === "created"
                ? "You haven't created any recipes yet."
                : "You haven't saved any recipes yet."}
            </Typography>
          </div>
        )}

        {!isLoading && displayedRecipes.length > 0 && (
          <div className="my-recipes-page__grid">
            {displayedRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                elevation={0}
                className="my-recipes-page__card"
              >
                <CardActionArea
                  className="my-recipes-page__card-action"
                  data-recipe-id={recipe.id}
                  onClick={handleCardClick}
                >
                  <CardContent className="my-recipes-page__card-content">
                    <Box className="my-recipes-page__card-image-wrapper">
                      <Box
                        component="img"
                        src={
                          recipe.imageUrl ||
                          "https://placehold.co/400x275?text=No+Image"
                        }
                        alt={recipe.title}
                        className="my-recipes-page__card-image"
                      />
                      <IconButton
                        size="small"
                        className="my-recipes-page__bookmark-btn"
                        data-recipe-id={recipe.id}
                        onClick={handleBookmarkClick}
                      >
                        {bookmarkedRecipeIds.has(recipe.id) ? (
                          <BookmarkIcon fontSize="small" />
                        ) : (
                          <BookmarkBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                    <Box className="my-recipes-page__card-body">
                      <Box className="my-recipes-page__card-title-row">
                        <Typography
                          variant="h6"
                          component="h2"
                          className="my-recipes-page__card-title"
                        >
                          {recipe.title}
                        </Typography>
                        {activeTab === "created" && (
                          <IconButton
                            size="small"
                            className="my-recipes-page__menu-btn"
                            data-recipe-id={recipe.id}
                            onClick={handleOpenMenu}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      {recipe.cookingTime && (
                        <Box className="my-recipes-page__card-time">
                          <AccessTimeIcon className="my-recipes-page__card-time-icon" />
                          <Typography
                            variant="body2"
                            className="my-recipes-page__card-time-text"
                          >
                            {recipe.cookingTime}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </div>
        )}

        <Menu
          anchorEl={menuAnchorElement}
          open={Boolean(menuAnchorElement)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={handleEditRecipe}>Edit</MenuItem>
          <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
        </Menu>

        <DeleteConfirmDialog
          open={deleteConfirmOpen}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}
