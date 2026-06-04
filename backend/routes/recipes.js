import express from "express";
import multer from "multer";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase.js";
import {
  createRecipe,
  getRecipesByUser,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getBookmarkedRecipeIds,
} from "../db/recipes.js";

export const router = express.Router();

const multerMemoryUpload = multer({ storage: multer.memoryStorage() });

async function uploadRecipeImage(imageFile, recipeId) {
  const imageExtension = imageFile.originalname.split(".").pop();
  const imageStoragePath = `recipe-images/${recipeId}-${Date.now()}.${imageExtension}`;
  const imageStorageRef = ref(storage, imageStoragePath);
  await uploadBytes(imageStorageRef, imageFile.buffer, {
    contentType: imageFile.mimetype,
  });
  return getDownloadURL(imageStorageRef);
}

function parseJsonField(rawValue) {
  if (!rawValue) return undefined;
  try {
    return JSON.parse(rawValue);
  } catch {
    return rawValue;
  }
}

// GET /recipes/user/:userId — get all recipes created by a user
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const userRecipes = await getRecipesByUser(userId);
  res.json(userRecipes);
});

// GET /recipes/:recipeId — get a single recipe
router.get("/:recipeId", async (req, res) => {
  const { recipeId } = req.params;
  const source = req.query.source;

  console.log("source is: ", source);

  const recipe = await getRecipeById(recipeId, source);

  if (!recipe) {
    return res.status(404).json({ error: "Recipe not found" });
  }

  res.json(recipe);
});

// POST /recipes — create a new recipe (multipart/form-data)
router.post("/", multerMemoryUpload.single("image"), async (req, res) => {
  const { userId, title, description, cookingTime } = req.body;
  const recipeSteps = parseJsonField(req.body.steps);
  const recipeIngredients = parseJsonField(req.body.ingredients);

  const createdRecipe = await createRecipe({
    userId,
    title,
    description,
    steps: recipeSteps || [],
    cookingTime,
    ingredients: recipeIngredients || [],
    imageUrl: "",
  });

  let imageDownloadUrl = "";
  if (req.file) {
    imageDownloadUrl = await uploadRecipeImage(req.file, createdRecipe.id);
    await updateRecipe({
      recipeId: createdRecipe.id,
      userId,
      imageUrl: imageDownloadUrl,
    });
  }

  res.status(201).json({ ...createdRecipe, imageUrl: imageDownloadUrl });
});

// PATCH /recipes/:recipeId — edit a recipe (multipart/form-data, image optional)
router.patch(
  "/:recipeId",
  multerMemoryUpload.single("image"),
  async (req, res) => {
    const { recipeId } = req.params;
    const { userId, title, description, cookingTime } = req.body;
    const recipeSteps = parseJsonField(req.body.steps);
    const recipeIngredients = parseJsonField(req.body.ingredients);

    let imageDownloadUrl;
    if (req.file) {
      imageDownloadUrl = await uploadRecipeImage(req.file, recipeId);
    }

    const updatedRecipe = await updateRecipe({
      recipeId,
      userId,
      title,
      description,
      steps: recipeSteps,
      cookingTime,
      ingredients: recipeIngredients,
      imageUrl: imageDownloadUrl,
    });

    res.json(updatedRecipe);
  },
);

// DELETE /recipes/:recipeId — delete a recipe
router.delete("/:recipeId", async (req, res) => {
  const { recipeId } = req.params;
  const { userId } = req.body;

  await deleteRecipe({ recipeId, userId });
  res.json({ message: "Recipe deleted successfully" });
});
