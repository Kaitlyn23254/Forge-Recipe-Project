import IngredientsList from "../components/IngredientsList";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

import "../styles/RecipeDetails.css";

const mockIngredients = [
  { ingredient: "carrot", measurement: "3.4 cup" },
  { ingredient: "onion", measurement: "1 large" },
  { ingredient: "garlic", measurement: "2 cloves" },
  { ingredient: "olive oil", measurement: "2 tbsp" },
];

export default function RecipeDetails() {
  const recipeImageUrl = "";
  const recipeTitle = "Eggs and Ham";
  const recipeTags = "Meat, eggs, breakfast";

  return (
    <div className="recipe-details">
      <div className="recipe-details-header">
        <img src={recipeImageUrl} alt={`Picture of ${recipeTitle}`} />
        <div className="recipe-details-header-text">
          <div className="recipe-details-header-title-row">
            <h1 className="recipe-details-title">{recipeTitle}</h1>
            <BookmarkBorderIcon />
          </div>
          <h4 className="recipe-details-tags">{recipeTags}</h4>
        </div>
      </div>
      <IngredientsList ingredients={mockIngredients} />
    </div>
  );
}
