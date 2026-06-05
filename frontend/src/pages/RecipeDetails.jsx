import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useParams, useSearchParams, Link, useNavigate } from "react-router";
import IngredientsList from "../components/IngredientsList";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { API_BASE_URL } from "../utility/api";
import { timestampToString } from "../utility/timestampToString";
import { getStoredUser } from "../utility/auth";

import "../styles/RecipeDetails.css";
import "../styles/Recipes.css";
import CommentSection from "../components/CommentSection";
import Comment from "../components/Comment";
import ChatBox from "../components/ChatBox";

const RECIPE_STATUS_LABELS = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

const RECIPE_STATUS_DESCRIPTIONS = {
  pending: "Your recipe is awaiting admin approval.",
  approved: "Your recipe is published and visible to everyone.",
  rejected: "Your recipe was not approved. You can edit and resubmit it.",
};

function normalizeInstructions(instructions) {
  if (Array.isArray(instructions)) return instructions;
  if (typeof instructions === "string" && instructions.trim()) {
    return instructions
      .split(/\r?\n+/)
      .map((step) => step.trim())
      .filter(Boolean);
  }
  return [];
}

export default function RecipeDetails() {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const [searchParams] = useSearchParams();
  const source =
    searchParams.get("source") === "official" ? "official" : "community";

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [recipeError, setRecipeError] = useState("");

  const { uid: userId } = getStoredUser() ?? {};

  const fetchRecipe = useCallback(async () => {
    if (!recipeId) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/recipes/${recipeId}`,
        { params: { source } },
      );
      setRecipe(response.data);
      setRecipeError("");
    } catch (err) {
      setRecipe(null);
      if (err.response?.status === 404) {
        setRecipeError("Recipe not found.");
      } else {
        setRecipeError("We could not load this recipe right now.");
      }
      console.error("Error fetching recipe: ", err);
    }
  }, [recipeId, source]);

  const loadRepliesForComment = async (commentId) => {
    const response = await axios.get(
      `${API_BASE_URL}/comments/${commentId}/replies`,
      { params: { userId } },
    );

    return response.data;
  };

  const fetchCommentsWithReplies = useCallback(async () => {
    if (!recipeId) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/comments/${recipeId}`,
        { params: { userId } },
      );

      const commentsWithReplies = await Promise.all(
        response.data.map(async (comment) => ({
          ...comment,
          replies: await loadRepliesForComment(comment.id),
        })),
      );

      setComments(commentsWithReplies);
    } catch (err) {
      console.error("Error fetching comments: ", err);
      setComments([]);
    }
  }, [recipeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recipeId) return;

    try {
      const payload = { recipeId, userId, text: commentText };
      if (commentRating != null) {
        payload.rating = commentRating;
      }

      const response = await axios.post(
        `${API_BASE_URL}/comments`,
        payload,
      );

      const newComment = response.data;
      const hadRating = commentRating != null;
      setComments((prevComments) => [
        ...prevComments,
        { ...newComment, replies: [] },
      ]);
      setCommentText("");
      setCommentRating(null);

      if (hadRating) {
        await fetchRecipe();
      }
    } catch (err) {
      console.log("Error posting comment: ", err);
    }
  };

  useEffect(() => {
    if (!recipeId) {
      setRecipeLoading(false);
      setCommentsLoading(false);
      setRecipeError("Recipe not found.");
      return;
    }

    setRecipe(null);
    setRecipeError("");
    setRecipeLoading(true);
    setCommentsLoading(true);

    async function loadPageData() {
      await Promise.all([
        fetchRecipe().finally(() => setRecipeLoading(false)),
        fetchCommentsWithReplies().finally(() => setCommentsLoading(false)),
      ]);
    }

    loadPageData();
  }, [recipeId, source, fetchRecipe, fetchCommentsWithReplies]);

  useEffect(() => {
    if (!recipeId || !userId) return;

    async function fetchSavedStatus() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/users/${userId}/bookmarks/ids`,
        );
        const bookmarkedIds = Array.isArray(response.data) ? response.data : [];
        setIsSaved(bookmarkedIds.includes(recipeId));
      } catch (err) {
        console.error("Error fetching saved recipe status: ", err);
      }
    }

    fetchSavedStatus();
  }, [recipeId, userId]);

  const handleReplySubmit = async (commentId, text) => {
    try {
      await axios.post(
        `${API_BASE_URL}/comments/${commentId}/replies`,
        { commentId, userId, text },
      );

      const replies = await loadRepliesForComment(commentId);

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? { ...comment, replies } : comment,
        ),
      );
    } catch (err) {
      console.log("Error posting reply: ", err);
    }
  };

  const handleReplyLike = async (commentId, replyId) => {
    try {
      const postResp = await axios.post(
        `${API_BASE_URL}/comments/${commentId}/replies/${replyId}/like`,
        { userId },
      );

      const updatedReply = postResp?.data;

      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id !== commentId) return comment;

          return {
            ...comment,
            replies: (comment.replies ?? []).map((reply) =>
              reply.id === replyId ? { ...reply, ...updatedReply } : reply,
            ),
          };
        }),
      );
    } catch (err) {
      console.log("Error getting reply like response: ", err);
    }
  };

  const handleReplyEdit = async (commentId, replyId, text) => {
    try {
      const resp = await axios.patch(
        `${API_BASE_URL}/comments/${commentId}/replies/${replyId}`,
        { userId, text },
      );

      const updatedReply = resp?.data;

      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id !== commentId) return comment;

          return {
            ...comment,
            replies: (comment.replies ?? []).map((reply) =>
              reply.id === replyId ? { ...reply, ...updatedReply } : reply,
            ),
          };
        }),
      );
    } catch (err) {
      console.log("Error editing reply: ", err);
    }
  };

  const handleReplyDelete = async (commentId, replyId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/comments/${commentId}/replies/${replyId}`,
        { data: { userId } },
      );

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: (comment.replies ?? []).filter(
                  (r) => r.id !== replyId,
                ),
              }
            : comment,
        ),
      );
    } catch (err) {
      console.log("Error deleting reply: ", err);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      const postResp = await axios.post(
        `${API_BASE_URL}/comments/${commentId}/like`,
        { userId },
      );

      const updatedComment = postResp?.data;

      setComments((prevComments) =>
        prevComments.map((c) =>
          c.id === commentId ? { ...c, ...updatedComment } : c,
        ),
      );
    } catch (err) {
      console.log("Error getting response: ", err);
    }
  };

  const handleSaveRecipe = async () => {
    if (!userId || !recipeId) return;

    const previousSaved = isSaved;
    setIsSaved(!previousSaved);
    const recipeType = recipe?.recipeType ?? source;

    try {
      if (previousSaved) {
        await axios.delete(
          `${API_BASE_URL}/users/${userId}/bookmarks/${recipeId}`,
        );
        setIsSaved(false);
      } else {
        await axios.post(
          `${API_BASE_URL}/users/${userId}/bookmarks/${recipeId}`,
          { recipeType },
        );
        setIsSaved(true);
      }
    } catch (err) {
      setIsSaved(previousSaved);
      console.log("Error saving recipe: ", err);
    }
  };

  const recipeImageUrl = recipe?.imageUrl ?? null;
  const recipeTitle = recipe?.title ?? "";
  const recipeTags = recipe?.tags ?? "";
  const rawInstructions = recipe?.instructions?.length
    ? recipe.instructions
    : (recipe?.steps ?? []);
  const recipeInstructions = normalizeInstructions(rawInstructions);
  const recipeIngredients = (recipe?.ingredients ?? []).map((ing) => ({
    ingredient: ing.ingredient || ing.name || "",
    measurement: ing.measurement || "",
  }));
  const averageRating = recipe?.averageRating ?? null;
  const ratingCount = recipe?.ratingCount ?? 0;
  const isOwnCommunityRecipe =
    source === "community" && recipe?.createdBy === userId;
  const recipeStatus = recipe?.status || "pending";

  const isLoading = commentsLoading || recipeLoading;

  function handleBack() {
    navigate(-1);
  }

  return (
    <div className="recipe-details-page">
      <div className="recipe-details-page__inner">
        <IconButton className="recipe-details-back-btn" onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        {isLoading ? (
          <div className="recipe-details-loading">
            <CircularProgress />
            <p>Loading...</p>
          </div>
        ) : recipeError || !recipe ? (
          <div className="recipe-details-error">
            <Typography variant="h5" component="p">
              {recipeError || "Recipe not found."}
            </Typography>
            <Typography
              component={Link}
              to="/recipes"
              className="recipe-details-error__link"
            >
              Back to recipes
            </Typography>
          </div>
        ) : (
          <div className="recipe-details">
            <div className="recipe-details-header">
              {recipeImageUrl ? (
                <img src={recipeImageUrl} alt={`Picture of ${recipeTitle}`} />
              ) : null}
              <div className="recipe-details-header-text">
                <div className="recipe-details-header-title-row">
                  <h1 className="recipe-details-title">{recipeTitle}</h1>
                  <IconButton
                    className="recipe-details-save-icon"
                    onClick={handleSaveRecipe}
                    aria-label={
                      isSaved ? "Remove saved recipe" : "Save recipe"
                    }
                  >
                    {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </div>
                <h4 className="recipe-details-tags">{recipeTags}</h4>
                {isOwnCommunityRecipe ? (
                  <Box className="recipe-details-status">
                    <Chip
                      label={
                        RECIPE_STATUS_LABELS[recipeStatus] || "Pending Review"
                      }
                      size="small"
                      className={`recipe-details-status__chip recipe-details-status__chip--${recipeStatus}`}
                    />
                    <Typography
                      variant="body2"
                      className="recipe-details-status__text"
                    >
                      {RECIPE_STATUS_DESCRIPTIONS[recipeStatus]}
                    </Typography>
                  </Box>
                ) : null}
                <div className="recipe-details-average-rating">
                  <Rating value={averageRating ?? 0} precision={0.5} readOnly />
                  <Typography variant="body2" component="span">
                    {ratingCount > 0
                      ? `${averageRating} · ${ratingCount} rating${ratingCount === 1 ? "" : "s"}`
                      : "No ratings yet"}
                  </Typography>
                </div>
              </div>
            </div>

            <div className="recipe-details-content">
              <div className="recipe-details-content-left">
                <div className="recipe-details-panel recipe-details-instructions">
                  <h2 className="recipe-details-panel__title">Instructions</h2>
                  <ol className="recipe-details-instructions__list">
                    {recipeInstructions.map((instruction, idx) => (
                      <li key={`${idx}-${instruction}`}>{instruction}</li>
                    ))}
                  </ol>
                  {recipe?.youtube || recipe?.sourceUrl ? (
                    <div className="recipes-page__recipe-dialog-links">
                      {recipe?.youtube ? (
                        <Button
                          component="a"
                          href={recipe.youtube}
                          target="_blank"
                          rel="noreferrer"
                          variant="outlined"
                        >
                          Watch video
                        </Button>
                      ) : null}
                      {recipe?.sourceUrl ? (
                        <Button
                          component="a"
                          href={recipe.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          variant="outlined"
                        >
                          Recipe source
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <CommentSection
                  commentText={commentText}
                  setCommentText={setCommentText}
                  handleSubmit={handleSubmit}
                  rating={commentRating}
                  setRating={setCommentRating}
                />
                <div className="recipe-details-comments">
                  {comments.map((c) => (
                    <Comment
                      key={
                        c.id ?? `${c.text}-${c.createdAt?.seconds ?? "unknown"}`
                      }
                      id={c.id}
                      username={c.username ?? "Unknown user"}
                      text={c.text}
                      numLikes={c.likeCount}
                      likedByUser={c.likedByUser ?? false}
                      createdAt={timestampToString(c.createdAt)}
                      handleCommentLike={handleCommentLike}
                      replies={c.replies ?? []}
                      onReplySubmit={handleReplySubmit}
                      onReplyLike={handleReplyLike}
                      onReplyEdit={handleReplyEdit}
                      onReplyDelete={handleReplyDelete}
                      currentUserId={userId}
                      commentUserId={c.userId}
                      rating={c.rating}
                      onCommentEdit={async (commentId, newText) => {
                        try {
                          const resp = await axios.patch(
                            `${API_BASE_URL}/comments/${commentId}`,
                            { userId, text: newText },
                          );

                          const updated = resp?.data;

                          setComments((prevComments) =>
                            prevComments.map((comment) =>
                              comment.id === commentId
                                ? { ...comment, ...updated }
                                : comment,
                            ),
                          );
                        } catch (err) {
                          console.log("Error editing comment: ", err);
                        }
                      }}
                      onCommentDelete={async (commentId) => {
                        try {
                          await axios.delete(
                            `${API_BASE_URL}/comments/${commentId}`,
                            { data: { userId } },
                          );

                          setComments((prevComments) =>
                            prevComments.filter((c) => c.id !== commentId),
                          );
                          await fetchRecipe();
                        } catch (err) {
                          console.log("Error deleting comment: ", err);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="recipe-details-content-right">
                <IngredientsList ingredients={recipeIngredients} />
                <ChatBox
                  recipeTitle={recipeTitle}
                  recipeInstructions={recipeInstructions}
                  recipeIngredients={recipeIngredients}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
