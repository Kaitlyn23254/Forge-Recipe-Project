import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";

// { userId, recipeId, recipeType, savedAt }

async function getSavedRecipe(userId, recipeId) {
  if (!userId || !recipeId) {
    throw new Error("userId and recipeId are required");
  }

  const savedRef = doc(db, "savedRecipes", `${userId}_${recipeId}`);
  const savedSnap = await getDoc(savedRef);
  return savedSnap.exists() ? savedSnap.data() : {};
}

async function saveRecipe(recipeId, userId, recipeType) {
  if (!recipeId || !userId || !recipeType) {
    throw new Error("recipeId, userId and recipeType are required");
  }

  const savedRef = doc(db, "savedRecipes", `${userId}_${recipeId}`);
  const existingSnap = await getDoc(savedRef);

  if (existingSnap.exists()) {
    await deleteDoc(savedRef);
    return { recipeId, userId, saved: false };
  }

  await setDoc(savedRef, {
    recipeId,
    userId,
    recipeType,
    savedAt: serverTimestamp(),
  });

  const savedSnap = await getDoc(savedRef);
  const savedData = savedSnap.exists() ? savedSnap.data() : {};

  return {
    id: savedRef.id,
    ...savedData,
    saved: true,
  };
}

export { saveRecipe, getSavedRecipe };
