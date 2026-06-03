import express from "express";
import { client } from "../openai.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { messages, recipeTitle, recipeInstructions, recipeIngredients } =
      req.body;
    console.log("messages is: ", messages);

    const systemPrompt = [
      `You are Chef Cook-A-Lot, a cooking assistant helping with the recipe "${recipeTitle ?? "this recipe"}".`,
      recipeInstructions ? `Recipe instructions: ${recipeInstructions}` : null,
      Array.isArray(recipeIngredients) && recipeIngredients.length > 0
        ? `Recipe ingredients: ${recipeIngredients.join(", ")}`
        : null,
      "Answer the user's questions using this recipe context when relevant.",
    ]
      .filter(Boolean)
      .join("\n\n");

    const response = await client.responses.create({
      model: "gpt-3.5-turbo",
      instructions: systemPrompt,
      input: messages,
    });

    console.log("response: ", response);

    return res.status(200).json({ output_text: response.output_text });
  } catch (err) {
    console.error("Error fetching openai response: ", err);
    return res.status(500).send("Error fetching from OpenAI API");
  }
});

export { router };
