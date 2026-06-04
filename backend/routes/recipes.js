import express from "express";
import { getAdminRecipes, updateRecipeStatus } from "../db/recipes.js";

const router = express.Router();

router.get("/admin", async function (req, res) {
  const { search, status } = req.query || {};

  try {
    const recipes = await getAdminRecipes({ search, status });
    return res.status(200).json(recipes);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to load recipes" });
  }
});

router.patch("/:recipeId/status", async function (req, res) {
  const { recipeId } = req.params;
  const { status } = req.body || {};

  if (!recipeId || !status) {
    return res.status(400).json({ error: "recipeId and status are required" });
  }

  try {
    const updatedRecipe = await updateRecipeStatus(recipeId, status);
    return res.status(200).json(updatedRecipe);
  } catch (err) {
    const message = err.message || "Unable to update recipe status";
    const statusCode = message === "Recipe not found" ? 404 : 400;
    return res.status(statusCode).json({ error: message });
  }
});

export { router };
