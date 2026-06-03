import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { fetchMealById, normalizeMealToRecipe, parseInstructionsText } from "../mealdb.js";

const commentsCollection = collection(db, "comments");

function isValidRatingValue(rating) {
  const n = Number(rating);
  if (Number.isNaN(n) || n <= 0 || n > 5) return false;
  return Math.abs(n * 2 - Math.round(n * 2)) < 1e-9;
}

async function getRatingSummaryForRecipe(recipeId) {
  const commentsQuery = query(
    commentsCollection,
    where("recipeId", "==", recipeId),
  );
  const snapshot = await getDocs(commentsQuery);

  const rated = snapshot.docs
    .map((d) => d.data().rating)
    .filter((rating) => isValidRatingValue(rating));

  if (rated.length === 0) {
    return { averageRating: null, ratingCount: 0 };
  }

  const sum = rated.reduce((acc, r) => acc + Number(r), 0);
  const averageRating = Math.round((sum / rated.length) * 10) / 10;

  return { averageRating, ratingCount: rated.length };
}

function normalizeFirestoreRecipe(recipeId, data) {
  const instructions = Array.isArray(data.instructions)
    ? data.instructions
    : parseInstructionsText(data.instructions);

  return {
    id: recipeId,
    title: data.title ?? "",
    imageUrl: data.imageUrl ?? null,
    tags: data.tags ?? "",
    instructions,
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    recipeType: data.recipeType ?? "community",
    averageRating: data.averageRating ?? null,
    ratingCount: data.ratingCount ?? 0,
  };
}

async function getRecipeById(recipeId, { source = "community" } = {}) {
  if (!recipeId) throw new Error("recipeId is required");

  if (source !== "official") {
    const recipeRef = doc(db, "recipes", recipeId);
    const recipeSnap = await getDoc(recipeRef);

    if (recipeSnap.exists()) {
      return normalizeFirestoreRecipe(recipeId, recipeSnap.data());
    }
  }

  if (source === "official") {
    const meal = await fetchMealById(recipeId);

    if (!meal) {
      const err = new Error("Recipe not found");
      err.statusCode = 404;
      throw err;
    }

    const ratingSummary = await getRatingSummaryForRecipe(recipeId);

    return {
      ...normalizeMealToRecipe(meal),
      ...ratingSummary,
    };
  }

  const err = new Error("Recipe not found");
  err.statusCode = 404;
  throw err;
}

async function recomputeRecipeAverageRating(recipeId) {
  if (!recipeId) throw new Error("recipeId is required");

  const commentsQuery = query(
    commentsCollection,
    where("recipeId", "==", recipeId),
  );
  const snapshot = await getDocs(commentsQuery);

  const rated = snapshot.docs
    .map((d) => d.data().rating)
    .filter((rating) => isValidRatingValue(rating));

  const recipeRef = doc(db, "recipes", recipeId);
  const recipeSnap = await getDoc(recipeRef);

  if (!recipeSnap.exists()) {
    return null;
  }

  if (rated.length === 0) {
    await updateDoc(recipeRef, { averageRating: null, ratingCount: 0 });
    return { averageRating: null, ratingCount: 0 };
  }

  const sum = rated.reduce((acc, r) => acc + Number(r), 0);
  const averageRating = Math.round((sum / rated.length) * 10) / 10;
  const ratingCount = rated.length;

  await updateDoc(recipeRef, { averageRating, ratingCount });

  return { averageRating, ratingCount };
}

export {
  getRecipeById,
  recomputeRecipeAverageRating,
  isValidRatingValue,
  getRatingSummaryForRecipe,
};
