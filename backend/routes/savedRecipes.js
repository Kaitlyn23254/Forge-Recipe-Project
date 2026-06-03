import express from "express";
import { saveRecipe, getSavedRecipe } from "../db/savedRecipes.js";

const router = express.Router();

// Get all user's saved recipes metadata
router.get("/:recipeId", async function (req, res) {
  const { userId } = req.query;
  const { recipeId } = req.params;

  if (!userId || !recipeId) {
    return res.status(400).json({ error: "userId and recipeId are required" });
  }

  try {
    const savedMetadata = await getSavedRecipe(userId, recipeId);
    return res.status(200).json(savedMetadata);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Post a new saved recipe (metadata)
router.post("/save/:recipeId", async function (req, res) {
  const { recipeId } = req.params;
  const { userId, recipeType } = req.body || {};

  if (!recipeId || !userId || !recipeType) {
    return res
      .status(400)
      .json({ error: "recipeId, userId and recipeType are required" });
  }

  try {
    const savedMetadata = await saveRecipe(recipeId, userId, recipeType);
    return res.status(savedMetadata.saved ? 201 : 200).json(savedMetadata);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export { router };
