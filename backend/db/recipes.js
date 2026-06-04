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
import {
  fetchMealById,
  normalizeMealToRecipe,
  parseInstructionsText,
} from "../mealdb.js";

const recipesCollection = collection(db, "recipes");
const usersCollection = collection(db, "users");
const allowedStatuses = new Set(["pending", "approved", "rejected"]);
const commentsCollection = collection(db, "comments");

function normalizeSearch(search) {
  return String(search || "")
    .trim()
    .toLowerCase();
}

function toSafeString(value) {
  return String(value || "").trim();
}

async function resolveSubmittedBy(recipeData, userCache) {
  const fromRecipe =
    toSafeString(recipeData.createdByName) ||
    toSafeString(recipeData.createdByDisplayName) ||
    toSafeString(recipeData.createdByEmail);

  if (fromRecipe) {
    return fromRecipe;
  }

  const createdBy = toSafeString(recipeData.createdBy);
  if (!createdBy) {
    return "Unknown";
  }

  if (userCache.has(createdBy)) {
    return userCache.get(createdBy);
  }

  try {
    const userRef = doc(usersCollection, createdBy);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      userCache.set(createdBy, createdBy);
      return createdBy;
    }

    const userData = userSnap.data() || {};
    const label =
      toSafeString(userData.name) || toSafeString(userData.email) || createdBy;

    userCache.set(createdBy, label);
    return label;
  } catch (err) {
    userCache.set(createdBy, createdBy);
    return createdBy;
  }
}

function shapeRecipeForAdmin(recipeDoc, submittedBy) {
  const data = recipeDoc.data() || {};

  return {
    id: recipeDoc.id,
    title: toSafeString(data.title) || "Untitled Recipe",
    description: toSafeString(data.description),
    imageUrl: toSafeString(data.imageUrl),
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    instructions: Array.isArray(data.instructions) ? data.instructions : [],
    averageRating: Number(data.averageRating || 0),
    ratingCount: Number(data.ratingCount || 0),
    status: allowedStatuses.has(data.status) ? data.status : "pending",
    createdBy: toSafeString(data.createdBy),
    submittedBy,
  };
}

async function getAdminRecipes({ search = "", status } = {}) {
  const normalizedSearch = normalizeSearch(search);
  const cleanStatus = toSafeString(status).toLowerCase();

  const recipesQuery = allowedStatuses.has(cleanStatus)
    ? query(recipesCollection, where("status", "==", cleanStatus))
    : recipesCollection;

  const snapshot = await getDocs(recipesQuery);
  const userCache = new Map();

  const allRecipes = await Promise.all(
    snapshot.docs.map(async (recipeDoc) => {
      const recipeData = recipeDoc.data() || {};
      const submittedBy = await resolveSubmittedBy(recipeData, userCache);
      return shapeRecipeForAdmin(recipeDoc, submittedBy);
    }),
  );

  const filteredRecipes = allRecipes.filter((recipe) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      recipe.title.toLowerCase().includes(normalizedSearch) ||
      recipe.submittedBy.toLowerCase().includes(normalizedSearch) ||
      recipe.status.toLowerCase().includes(normalizedSearch)
    );
  });

  filteredRecipes.sort((a, b) => a.title.localeCompare(b.title));

  return filteredRecipes;
}

async function updateRecipeStatus(recipeId, status) {
  const cleanRecipeId = toSafeString(recipeId);
  const cleanStatus = toSafeString(status).toLowerCase();

  if (!cleanRecipeId) {
    throw new Error("recipeId is required");
  }

  if (!allowedStatuses.has(cleanStatus)) {
    throw new Error('status must be "pending", "approved", or "rejected"');
  }

  const recipeRef = doc(recipesCollection, cleanRecipeId);
  const existingRecipe = await getDoc(recipeRef);

  if (!existingRecipe.exists()) {
    throw new Error("Recipe not found");
  }

  await updateDoc(recipeRef, { status: cleanStatus });

  const recipeData = existingRecipe.data() || {};
  const userCache = new Map();
  const submittedBy = await resolveSubmittedBy(recipeData, userCache);

  return {
    ...shapeRecipeForAdmin(existingRecipe, submittedBy),
    status: cleanStatus,
  };
}

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
    youtube: data.youtube ?? "",
    sourceUrl: data.sourceUrl ?? "",
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
  getAdminRecipes,
  updateRecipeStatus,
};
