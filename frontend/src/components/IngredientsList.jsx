import Box from "@mui/material/Box";

// ingredients is an array of {
//   ingredient: string (e.g 'carrot')
//   measurement: string (e.g '3.4 cup')
// }

export default function IngredientsList({ ingredients }) {
  return (
    <div
      className="ingredients-list"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "fit-content",
        margin: "0 auto",
      }}
    >
      <h2 className="ingredients-title">Ingredients</h2>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "max-content max-content",
          columnGap: 10,
          rowGap: 1,
          alignItems: "center",
          justifyItems: "center",
          justifyContent: "center",
          width: "20rem",
          p: 2,
          border: 1,
        }}
      >
        {ingredients.map((ingredient, index) => (
          <>
            <Box key={`measurement-${ingredient.measurement}-${index}`}>
              {ingredient.measurement}
            </Box>
            <Box key={`ingredient-${ingredient.ingredient}-${index}`}>
              {ingredient.ingredient}
            </Box>
          </>
        ))}
      </Box>
    </div>
  );
}
