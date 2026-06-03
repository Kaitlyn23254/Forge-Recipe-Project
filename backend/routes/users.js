import express from "express";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  getBookmarkedRecipeIds,
} from "../db/recipes.js";

export const router = express.Router();

// GET /users/:userId/bookmarks — get full recipe objects for all saved recipes
router.get("/:userId/bookmarks", async (req, res) => {
  const { userId } = req.params;
  const savedRecipes = await getBookmarks(userId);
  res.json(savedRecipes);
});

// GET /users/:userId/bookmarks/ids — get just the recipeIds the user has bookmarked
router.get("/:userId/bookmarks/ids", async (req, res) => {
  const { userId } = req.params;
  const bookmarkedRecipeIds = await getBookmarkedRecipeIds(userId);
  res.json(bookmarkedRecipeIds);
});

// POST /users/:userId/bookmarks/:recipeId — save a recipe
router.post("/:userId/bookmarks/:recipeId", async (req, res) => {
  const { userId, recipeId } = req.params;
  await addBookmark(userId, recipeId);
  res.status(201).json({ message: "Recipe saved to bookmarks" });
});

// DELETE /users/:userId/bookmarks/:recipeId — unsave a recipe
router.delete("/:userId/bookmarks/:recipeId", async (req, res) => {
  const { userId, recipeId } = req.params;
  await removeBookmark(userId, recipeId);
  res.json({ message: "Recipe removed from bookmarks" });
});
