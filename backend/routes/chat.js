import express from "express";
import { client } from "../openai.js";

const router = express.Router();

router.post("/", async (req, res) => {
  if (!client) {
    return res.status(503).json({ error: "Chatbot unavailable: OPENAI_API_KEY not configured." });
  }

  try {
    const { messages, recipeTitle, recipeInstructions, recipeIngredients } =
      req.body;
    console.log("messages is: ", messages);

    const systemPrompt = [
      `You are Chef Cook-A-Lot, a cooking assistant helping with the recipe "${recipeTitle ?? "this recipe"}".`,
      recipeInstructions ? `Recipe instructions: ${recipeInstructions}` : null,
      recipeIngredients
        ? `Recipe ingredients and measurements (in JSON format): ${JSON.stringify(recipeIngredients)}`
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

    if (err.status === 401 || err.code === "invalid_api_key") {
      return res.status(503).json({
        error:
          "Chatbot unavailable: invalid OpenAI API key. Update OPENAI_API_KEY in backend/.env.",
      });
    }

    return res.status(500).json({
      error: err.message || "Unable to fetch a response from the cooking assistant.",
    });
  }
});

export { router };
