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

const commentsCollection = collection(db, "comments");

function isValidRatingValue(rating) {
  const n = Number(rating);
  if (Number.isNaN(n) || n <= 0 || n > 5) return false;
  return Math.abs(n * 2 - Math.round(n * 2)) < 1e-9;
}

async function getRecipeById(recipeId) {
  if (!recipeId) throw new Error("recipeId is required");

  const recipeRef = doc(db, "recipes", recipeId);
  const recipeSnap = await getDoc(recipeRef);

  if (!recipeSnap.exists()) {
    const err = new Error("Recipe not found");
    err.statusCode = 404;
    throw err;
  }

  return { id: recipeSnap.id, ...recipeSnap.data() };
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
};
