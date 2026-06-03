const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

function parseMealIngredients(meal) {
  const ingredients = [];

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim();
    const measurement = meal[`strMeasure${index}`]?.trim();

    if (ingredient) {
      ingredients.push({
        ingredient,
        measurement: measurement || "",
      });
    }
  }

  return ingredients;
}

function parseMealTags(meal) {
  if (!meal.strTags) return [];
  return meal.strTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseInstructionsText(instructions) {
  if (!instructions) return [];
  return String(instructions)
    .split(/\r?\n+/)
    .map((step) => step.trim())
    .filter(Boolean);
}

function buildTagsString(meal) {
  const parts = [
    meal.strCategory,
    meal.strArea,
    ...parseMealTags(meal),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "";
}

async function fetchMealById(recipeId) {
  const response = await fetch(
    `${MEALDB_BASE_URL}/lookup.php?i=${encodeURIComponent(recipeId)}`,
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.meals?.[0] ?? null;
}

function normalizeMealToRecipe(meal) {
  return {
    id: meal.idMeal,
    title: meal.strMeal,
    imageUrl: meal.strMealThumb || null,
    tags: buildTagsString(meal),
    instructions: parseInstructionsText(meal.strInstructions),
    ingredients: parseMealIngredients(meal),
    recipeType: "official",
  };
}

export {
  fetchMealById,
  normalizeMealToRecipe,
  parseInstructionsText,
};
