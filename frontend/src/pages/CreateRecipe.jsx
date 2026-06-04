import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import { Button, IconButton, Paper, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StepField from "../components/StepField";
import IngredientRow from "../components/IngredientRow";
import buildRecipeFormData from "../utility/buildRecipeFormData";
import "../styles/CreateRecipe.css";

const HARDCODED_USER_ID = "X7CtVm0P6YeWybH4ZL75";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function CreateRecipe() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editRecipeId = searchParams.get("edit");

  const [recipeTitle, setRecipeTitle] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");
  const [recipeSteps, setRecipeSteps] = useState([""]);
  const [cookingTime, setCookingTime] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState([
    { measurement: "", name: "" },
  ]);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!editRecipeId) return;

    async function fetchRecipeForEdit() {
      const response = await axios.get(`${BASE_URL}/recipes/${editRecipeId}`);
      const recipe = response.data;
      setRecipeTitle(recipe.title || "");
      setRecipeDescription(recipe.description || "");
      setRecipeSteps(Array.isArray(recipe.steps) && recipe.steps.length > 0 ? recipe.steps : [""]);
      setCookingTime(recipe.cookingTime || "");
      setRecipeIngredients(
        Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0
          ? recipe.ingredients.map((ing) => ({ measurement: ing.measurement || "", name: ing.name || ing.ingredient || "" }))
          : [{ measurement: "", name: "" }],
      );
      setImageUrl(recipe.imageUrl || "");
    }

    fetchRecipeForEdit();
  }, [editRecipeId]);

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

  function handleImageUrlChange(event) {
    setImageUrl(event.target.value);
  }

  function handleAddIngredient() {
    setRecipeIngredients((previousIngredients) => [
      ...previousIngredients,
      { measurement: "", name: "" },
    ]);
  }

  function validateForm() {
    const errors = {};

    if (!recipeTitle.trim()) {
      errors.recipeTitle = "Recipe name is required.";
    }
    if (!recipeDescription.trim()) {
      errors.recipeDescription = "Description is required.";
    }
    if (!cookingTime.trim()) {
      errors.cookingTime = "Cooking time is required.";
    }
    const hasFilledStep = recipeSteps.some((step) => step.trim());
    if (!hasFilledStep) {
      errors.recipeSteps = "At least one step is required.";
    }
    const hasFilledIngredient = recipeIngredients.some(
      (ingredient) => ingredient.name.trim() && ingredient.measurement.trim(),
    );
    if (!hasFilledIngredient) {
      errors.recipeIngredients = "At least one ingredient with name and measurement is required.";
    }

    return errors;
  }

  function handleBack() {
    navigate(-1);
  }

  async function handleFormSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const formData = buildRecipeFormData({
      userId: HARDCODED_USER_ID,
      recipeTitle,
      recipeDescription,
      recipeSteps,
      cookingTime,
      recipeIngredients,
      imageUrl,
    });

    if (editRecipeId) {
      await axios.patch(`${BASE_URL}/recipes/${editRecipeId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await axios.post(`${BASE_URL}/recipes`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    setIsSubmitting(false);
    navigate("/my-recipes");
  }

  return (
    <div className="create-recipe-overlay">
      <Paper className="create-recipe-modal" elevation={3}>
        <div className="create-recipe-modal__header">
          {editRecipeId && (
            <IconButton className="create-recipe-modal__back-btn" onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h5" className="create-recipe-modal__title">
            {editRecipeId ? "Edit Recipe" : "Add New Recipe"}
          </Typography>
        </div>

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
              error={Boolean(formErrors.recipeTitle)}
              helperText={formErrors.recipeTitle}
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
              error={Boolean(formErrors.recipeDescription)}
              helperText={formErrors.recipeDescription}
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
                error={Boolean(formErrors.recipeSteps) && stepIndex === 0}
                helperText={stepIndex === 0 ? formErrors.recipeSteps : undefined}
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
              error={Boolean(formErrors.cookingTime)}
              helperText={formErrors.cookingTime}
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
                error={Boolean(formErrors.recipeIngredients) && ingredientIndex === 0}
              />
            ))}
            {formErrors.recipeIngredients && (
              <Typography className="create-recipe__field-error">
                {formErrors.recipeIngredients}
              </Typography>
            )}
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
              Display Image URL
            </Typography>
            <TextField
              fullWidth
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={handleImageUrlChange}
              className="create-recipe__input"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Recipe preview"
                className="create-recipe__image-preview"
              />
            )}
          </div>

          <Button
            type="submit"
            className="create-recipe__submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding Recipe..." : "Add Recipe"}
          </Button>
        </form>
      </Paper>
    </div>
  );
}
