import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { router as commentsRouter } from "./routes/comments.js";
import { router as savedRecipesRouter } from "./routes/savedRecipes.js";
import { router as chatRouter } from "./routes/chat.js";
import { router as recipesRouter } from "./routes/recipes.js";
import { router as usersRouter } from "./routes/users.js";

const app = express();
const port = 5005;

app.use(express.json());
app.use(cors());
app.use("/comments", commentsRouter);
app.use("/saved-recipes", savedRecipesRouter);
app.use("/chat", chatRouter);
app.use("/recipes", recipesRouter);
app.use("/users", usersRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
