import express from "express";
import { getRecipeById } from "../db/recipes.js";

const router = express.Router();

router.get("/:recipeId", async function (req, res) {
  const { recipeId } = req.params;

  if (!recipeId) {
    return res.status(400).json({ error: "recipeId is required" });
  }

  try {
    const recipe = await getRecipeById(recipeId);
    return res.json(recipe);
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

export { router };
