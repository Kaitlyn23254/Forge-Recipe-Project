import { TextField } from "@mui/material";

export default function IngredientRow({ ingredient, ingredientIndex, onIngredientChange }) {
  function handleMeasurementChange(event) {
    onIngredientChange(event.target.value, ingredientIndex, "measurement");
  }

  function handleNameChange(event) {
    onIngredientChange(event.target.value, ingredientIndex, "name");
  }

  return (
    <div className="create-recipe__ingredient-row">
      <TextField
        placeholder="Measurement"
        value={ingredient.measurement}
        onChange={handleMeasurementChange}
        className="create-recipe__input"
      />
      <TextField
        placeholder="Ingredient Name"
        value={ingredient.name}
        onChange={handleNameChange}
        className="create-recipe__input"
      />
    </div>
  );
}
