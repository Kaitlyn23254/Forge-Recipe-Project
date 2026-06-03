import { TextField } from "@mui/material";

export default function StepField({ value, stepIndex, onStepChange }) {
  function handleChange(event) {
    onStepChange(event.target.value, stepIndex);
  }

  return (
    <div className="create-recipe__step-row">
      <TextField
        fullWidth
        placeholder={`Step ${stepIndex + 1}`}
        value={value}
        onChange={handleChange}
        className="create-recipe__input"
      />
    </div>
  );
}
