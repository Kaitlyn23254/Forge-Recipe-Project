import express from "express";
import {
  getCommentsByRecipeId,
  postComment,
  likeComment,
} from "../db/comments.js";

const router = express.Router();

router.get("/:recipeId", async function (req, res) {
  const { recipeId } = req.params;
  const { userId } = req.query || {};

  if (!recipeId) return res.status(400).json({ error: "recipeId is required" });

  try {
    const comments = await getCommentsByRecipeId(recipeId, userId);
    return res.json(comments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", async function (req, res) {
  const { recipeId, userId, text, rating } = req.body || {};
  if (!recipeId || !userId || !text) {
    return res
      .status(400)
      .json({ error: "recipeId, userId and text are required" });
  }

  try {
    const created = await postComment({ recipeId, userId, text, rating });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/:commentId/like", async function (req, res) {
  const { commentId } = req.params;
  const { userId } = req.body || {};
  if (!commentId || !userId)
    return res.status(400).json({ error: "commentId and userId are required" });

  try {
    const result = await likeComment(commentId, userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export { router };
