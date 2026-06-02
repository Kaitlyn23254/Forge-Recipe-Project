import IngredientsList from "../components/IngredientsList";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

import "../styles/RecipeDetails.css";

export default function RecipeDetails() {
  const recipeImageUrl = "";
  const recipeTitle = "Eggs and Ham";
  const recipeTags = "Meat, eggs, breakfast";
  const recipeInstructions = [
    "Place a large skillet over medium heat and add the olive oil.",
    "Saute the onion and garlic for 2 to 3 minutes until fragrant.",
    "Add the carrots and cook for 5 minutes, stirring occasionally.",
    "Crack in the eggs and gently stir until set to your preferred texture.",
    "Season to taste and serve immediately while warm.",
  ];
  const mockIngredients = [
    { ingredient: "carrot", measurement: "3.4 cup" },
    { ingredient: "onion", measurement: "1 large" },
    { ingredient: "garlic", measurement: "2 cloves" },
    { ingredient: "olive oil", measurement: "2 tbsp" },
  ];

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

      <div className="recipe-details-instructions-container">
        <h2 className="recipe-details-instructions-title">Instructions</h2>
        <ol>
          {recipeInstructions.map((instruction, idx) => (
            <li key={instruction - `${instruction.length}` - `${idx}`}>
              {instruction}
            </li>
          ))}
        </ol>
      </div>
      <IngredientsList ingredients={mockIngredients} />
    </div>
  );
}
