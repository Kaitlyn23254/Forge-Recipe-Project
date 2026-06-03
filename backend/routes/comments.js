import express from "express";
import {
  getCommentsByRecipeId,
  postComment,
  likeComment,
  editComment,
  deleteComment,
} from "../db/comments.js";
import {
  deleteReply,
  editReply,
  getRepliesByCommentId,
  likeReply,
  postReply,
} from "../db/replies.js";

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

router.patch("/:commentId", async function (req, res) {
  const { commentId } = req.params;
  const { userId, text } = req.body || {};

  if (!commentId || !userId || !text) {
    return res.status(400).json({ error: "commentId, userId and text are required" });
  }

  try {
    const updated = await editComment({ commentId, userId, text });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:commentId", async function (req, res) {
  const { commentId } = req.params;
  const { userId } = req.body || {};

  if (!commentId || !userId) {
    return res.status(400).json({ error: "commentId and userId are required" });
  }

  try {
    const deleted = await deleteComment({ commentId, userId });
    return res.json(deleted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:commentId/replies", async function (req, res) {
  const { commentId } = req.params;
  const { userId } = req.query || {};

  if (!commentId) {
    return res.status(400).json({ error: "commentId is required" });
  }

  try {
    const replies = await getRepliesByCommentId(commentId, userId);
    return res.json(replies);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/:commentId/replies", async function (req, res) {
  const { commentId } = req.params;
  const { userId, text } = req.body || {};

  if (!commentId || !userId || !text) {
    return res
      .status(400)
      .json({ error: "commentId, userId and text are required" });
  }

  try {
    const created = await postReply({ commentId, userId, text });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch("/:commentId/replies/:replyId", async function (req, res) {
  const { commentId, replyId } = req.params;
  const { userId, text } = req.body || {};

  if (!commentId || !replyId || !userId || !text) {
    return res
      .status(400)
      .json({ error: "commentId, replyId, userId and text are required" });
  }

  try {
    const updated = await editReply({ commentId, replyId, userId, text });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:commentId/replies/:replyId", async function (req, res) {
  const { commentId, replyId } = req.params;
  const { userId } = req.body || {};

  if (!commentId || !replyId || !userId) {
    return res
      .status(400)
      .json({ error: "commentId, replyId and userId are required" });
  }

  try {
    const deleted = await deleteReply({ commentId, replyId, userId });
    return res.json(deleted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/:commentId/replies/:replyId/like", async function (req, res) {
  const { commentId, replyId } = req.params;
  const { userId } = req.body || {};

  if (!commentId || !replyId || !userId) {
    return res
      .status(400)
      .json({ error: "commentId, replyId and userId are required" });
  }

  try {
    const updated = await likeReply(commentId, replyId, userId);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export { router };
