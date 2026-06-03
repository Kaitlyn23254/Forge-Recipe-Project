import "../styles/RecipeDetails.css";

export default function IngredientsList({ ingredients }) {
  return (
    <div className="recipe-details-panel recipe-details-ingredients">
      <h2 className="recipe-details-panel__title">Ingredients</h2>
      <div className="recipe-details-ingredients__list">
        {ingredients.map((ingredient, index) => (
          <div
            key={`${ingredient.ingredient}-${ingredient.measurement}-${index}`}
            className="recipe-details-ingredients__row"
          >
            <span className="recipe-details-ingredients__measurement">
              {ingredient.measurement}
            </span>
            <span className="recipe-details-ingredients__name">
              {ingredient.ingredient}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
