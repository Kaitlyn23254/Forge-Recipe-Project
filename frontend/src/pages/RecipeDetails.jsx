import IngredientsList from "../components/IngredientsList";

const mockIngredients = [
  { ingredient: "carrot", measurement: "3.4 cup" },
  { ingredient: "onion", measurement: "1 large" },
  { ingredient: "garlic", measurement: "2 cloves" },
  { ingredient: "olive oil", measurement: "2 tbsp" },
];

export default function RecipeDetails() {
  return <IngredientsList ingredients={mockIngredients} />;
}
