import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Button, Paper, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import StepField from "../components/StepField";
import IngredientRow from "../components/IngredientRow";
import ImageDropzone from "../components/ImageDropzone";
import buildRecipeFormData from "../utility/buildRecipeFormData";
import "../styles/CreateRecipe.css";

const HARDCODED_USER_ID = "X7CtVm0P6YeWybH4ZL75";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function CreateRecipe() {
  const navigate = useNavigate();

  const [recipeTitle, setRecipeTitle] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");
  const [recipeSteps, setRecipeSteps] = useState([""]);
  const [cookingTime, setCookingTime] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState([
    { measurement: "", name: "" },
  ]);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleRecipeTitleChange(event) {
    setRecipeTitle(event.target.value);
  }

  function handleDescriptionChange(event) {
    setRecipeDescription(event.target.value);
  }

  function handleStepChange(newValue, stepIndex) {
    setRecipeSteps((previousSteps) => {
      const updatedSteps = [...previousSteps];
      updatedSteps[stepIndex] = newValue;
      return updatedSteps;
    });
  }

  function handleAddStep() {
    setRecipeSteps((previousSteps) => [...previousSteps, ""]);
  }

  function handleCookingTimeChange(event) {
    setCookingTime(event.target.value);
  }

  function handleIngredientChange(newValue, ingredientIndex, fieldName) {
    setRecipeIngredients((previousIngredients) => {
      const updatedIngredients = [...previousIngredients];
      updatedIngredients[ingredientIndex] = {
        ...updatedIngredients[ingredientIndex],
        [fieldName]: newValue,
      };
      return updatedIngredients;
    });
  }

  function handleAddIngredient() {
    setRecipeIngredients((previousIngredients) => [
      ...previousIngredients,
      { measurement: "", name: "" },
    ]);
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = buildRecipeFormData({
      userId: HARDCODED_USER_ID,
      recipeTitle,
      recipeDescription,
      recipeSteps,
      cookingTime,
      recipeIngredients,
      selectedImageFile,
    });

    await axios.post(`${BASE_URL}/recipes`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setIsSubmitting(false);
    navigate("/my-recipes");
  }

  return (
    <div className="create-recipe-overlay">
      <Paper className="create-recipe-modal" elevation={3}>
        <Typography variant="h5" className="create-recipe-modal__title">
          Add New Recipe
        </Typography>

        <form onSubmit={handleFormSubmit}>
          <div className="create-recipe__field-group">
            <Typography component="label" className="create-recipe__label">
              Recipe Name
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g. Best Lasagna Ever"
              value={recipeTitle}
              onChange={handleRecipeTitleChange}
              className="create-recipe__input"
              required
            />
          </div>

          <div className="create-recipe__field-group">
            <Typography component="label" className="create-recipe__label">
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe your recipe..."
              value={recipeDescription}
              onChange={handleDescriptionChange}
              className="create-recipe__input"
            />
          </div>

          <div className="create-recipe__field-group">
            <Typography component="label" className="create-recipe__label">
              Steps
            </Typography>
            {recipeSteps.map((recipeStep, stepIndex) => (
              <StepField
                key={stepIndex}
                value={recipeStep}
                stepIndex={stepIndex}
                onStepChange={handleStepChange}
              />
            ))}
            <Button className="create-recipe__add-btn" onClick={handleAddStep} type="button">
              <AddIcon />
              Add Step
            </Button>
          </div>

          <div className="create-recipe__field-group">
            <Typography component="label" className="create-recipe__label">
              Cooking Time
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g. 45 mins"
              value={cookingTime}
              onChange={handleCookingTimeChange}
              className="create-recipe__input"
            />
          </div>

          <div className="create-recipe__field-group">
            <Typography component="label" className="create-recipe__label">
              Ingredients
            </Typography>
            {recipeIngredients.map((recipeIngredient, ingredientIndex) => (
              <IngredientRow
                key={ingredientIndex}
                ingredient={recipeIngredient}
                ingredientIndex={ingredientIndex}
                onIngredientChange={handleIngredientChange}
              />
            ))}
            <Button
              className="create-recipe__add-btn"
              onClick={handleAddIngredient}
              type="button"
            >
              <AddIcon />
              Add Ingredient
            </Button>
          </div>

          <div className="create-recipe__field-group">
            <Typography component="label" className="create-recipe__label">
              Display Image
            </Typography>
            <ImageDropzone onImageSelect={setSelectedImageFile} />
          </div>

          <Button
            type="submit"
            className="create-recipe__submit-btn"
            disabled={isSubmitting || !recipeTitle.trim()}
          >
            {isSubmitting ? "Adding Recipe..." : "Add Recipe"}
          </Button>
        </form>
      </Paper>
    </div>
  );
}
