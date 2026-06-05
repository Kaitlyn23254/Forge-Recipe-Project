export default function buildRecipeFormData({
  userId,
  recipeTitle,
  recipeDescription,
  recipeSteps,
  cookingTime,
  recipeIngredients,
  imageUrl,
  selectedImageFile,
}) {
  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("title", recipeTitle);
  formData.append("description", recipeDescription);
  formData.append("steps", JSON.stringify(recipeSteps.filter((step) => step.trim())));
  formData.append("cookingTime", cookingTime);
  formData.append(
    "ingredients",
    JSON.stringify(recipeIngredients.filter((ingredient) => ingredient.name.trim())),
  );
  if (imageUrl?.trim()) {
    formData.append("imageUrl", imageUrl.trim());
  }
  if (selectedImageFile) {
    formData.append("image", selectedImageFile);
  }
  return formData;
}
