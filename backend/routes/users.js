import express from "express";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  getBookmarkedRecipeIds,
} from "../db/recipes.js";
import { createUser, getUsersCount, loginUser } from "../db/users.js";

const router = express.Router();

router.post("/register", async function (req, res) {
  const { name, email, password, role } = req.body || {};

  try {
    const user = await createUser({ name, email, password, role });
    return res.status(201).json(user);
  } catch (err) {
    const message = err.message || "Unable to create account";
    const statusCode = message.includes("already exists") ? 409 : 400;
    return res.status(statusCode).json({ error: message });
  }
});

router.post("/login", async function (req, res) {
  const { email, password } = req.body || {};

  try {
    const user = await loginUser({ email, password });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(401).json({ error: err.message || "Unable to log in" });
  }
});

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
  const recipeType = req.body?.recipeType ?? "community";
  await addBookmark(userId, recipeId, recipeType);
  res.status(201).json({ message: "Recipe saved to bookmarks" });
});

// DELETE /users/:userId/bookmarks/:recipeId — unsave a recipe
router.delete("/:userId/bookmarks/:recipeId", async (req, res) => {
  const { userId, recipeId } = req.params;
  await removeBookmark(userId, recipeId);
  res.json({ message: "Recipe removed from bookmarks" });
});

router.get("/count", async function (req, res) {
  try {
    const count = await getUsersCount();
    return res.status(200).json({ count });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to load user count" });
  }
});

export { router };
