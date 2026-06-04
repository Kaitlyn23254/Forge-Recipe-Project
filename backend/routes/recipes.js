import express from "express";
import {
  getAdminRecipes,
  updateRecipeStatus,
  getRecipeById,
} from "../db/recipes.js";

const router = express.Router();

router.get("/admin", async function (req, res) {
  const { search, status } = req.query || {};

  try {
    const recipes = await getAdminRecipes({ search, status });
    return res.status(200).json(recipes);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Unable to load recipes" });
  }
});

router.get("/:recipeId", async function (req, res) {
  const { recipeId } = req.params;
  const source = req.query.source === "official" ? "official" : "community";

  console.log("recipe id is: ", recipeId);
  console.log("source Is: ", source);

  if (!recipeId) {
    return res.status(400).json({ error: "recipeId is required" });
  }

  try {
    const recipe = await getRecipeById(recipeId, source);
    return res.json(recipe);
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
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
