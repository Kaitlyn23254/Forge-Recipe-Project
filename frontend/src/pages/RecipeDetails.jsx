import { useState, useEffect } from "react";
import axios from "axios";
import IngredientsList from "../components/IngredientsList";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { timestampToString } from "../utility/timestampToString";

import "../styles/RecipeDetails.css";
import CommentSection from "../components/CommentSection";
import Comment from "../components/Comment";
import ChatBox from "../components/ChatBox";

const userId = "X7CtVm0P6YeWybH4ZL75";
const recipeId = "4mHCcLEftQemlwQ2Zydn";
const recipeType = "community";
const username = "johnbob";

const FALLBACK_RECIPE = {
  title: "Eggs and Ham",
  tags: "Meat, eggs, breakfast",
  instructions: [
    "Place a large skillet over medium heat and add the olive oil.",
    "Saute the onion and garlic for 2 to 3 minutes until fragrant.",
    "Add the carrots and cook for 5 minutes, stirring occasionally.",
    "Crack in the eggs and gently stir until set to your preferred texture.",
    "Season to taste and serve immediately while warm.",
  ],
  ingredients: [
    { ingredient: "carrot", measurement: "3.4 cup" },
    { ingredient: "onion", measurement: "1 large" },
    { ingredient: "garlic", measurement: "2 cloves" },
    { ingredient: "olive oil", measurement: "2 tbsp" },
  ],
  imageUrl: null,
  averageRating: null,
  ratingCount: 0,
};

export default function RecipeDetails() {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/recipes/${recipeId}`,
      );
      setRecipe(response.data);
      setRecipeLoading(false);
    } catch (err) {
      console.error("Error fetching recipe: ", err);
    }
  };

  const loadRepliesForComment = async (commentId) => {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/comments/${commentId}/replies`,
      { params: { userId } },
    );

    return response.data;
  };

  const fetchCommentsWithReplies = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/comments/${recipeId}`,
      { params: { userId } },
    );

    const commentsWithReplies = await Promise.all(
      response.data.map(async (comment) => ({
        ...comment,
        replies: await loadRepliesForComment(comment.id),
      })),
    );

    setComments(commentsWithReplies);
    setCommentsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { recipeId, userId, text: commentText };
      if (commentRating != null) {
        payload.rating = commentRating;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/comments`,
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
    fetchRecipe();
    fetchCommentsWithReplies().catch((err) => {
      console.error("Error fetching comments: ", err);
    });
  }, []);

  useEffect(() => {
    async function fetchSavedStatus() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/saved-recipes/${recipeId}`,
          { params: { userId } },
        );

        setIsSaved(Boolean(response.data?.recipeId));
      } catch (err) {
        console.error("Error fetching saved recipe status: ", err);
      }
    }

    fetchSavedStatus();
  }, []);

  const handleReplySubmit = async (commentId, text) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/comments/${commentId}/replies`,
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
        `${import.meta.env.VITE_BASE_URL}/comments/${commentId}/replies/${replyId}/like`,
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
        `${import.meta.env.VITE_BASE_URL}/comments/${commentId}/replies/${replyId}`,
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
        `${import.meta.env.VITE_BASE_URL}/comments/${commentId}/replies/${replyId}`,
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
        `${import.meta.env.VITE_BASE_URL}/comments/${commentId}/like`,
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
    const previousSaved = isSaved;
    setIsSaved(!previousSaved);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/saved-recipes/save/${recipeId}`,
        { userId, recipeType },
      );

      setIsSaved(response.data.saved);
    } catch (err) {
      setIsSaved(previousSaved);
      console.log("Error saving recipe: ", err);
    }
  };

  const recipeImageUrl = recipe?.imageUrl ?? FALLBACK_RECIPE.imageUrl;
  const recipeTitle = recipe?.title ?? FALLBACK_RECIPE.title;
  const recipeTags = recipe?.tags ?? FALLBACK_RECIPE.tags;
  const recipeInstructions =
    recipe?.instructions ?? FALLBACK_RECIPE.instructions;
  const recipeIngredients = recipe?.ingredients ?? FALLBACK_RECIPE.ingredients;
  const averageRating = recipe?.averageRating ?? FALLBACK_RECIPE.averageRating;
  const ratingCount = recipe?.ratingCount ?? FALLBACK_RECIPE.ratingCount;

  return (
    <div className="recipe-details-page">
      <div className="recipe-details-page__inner">
        {commentsLoading || recipeLoading ? (
          <div className="recipe-details-loading">
            <CircularProgress />
            <p>Loading...</p>
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
                  {isSaved ? (
                    <BookmarkIcon
                      className="recipe-details-save-icon"
                      onClick={handleSaveRecipe}
                      role="button"
                      aria-label="Remove saved recipe"
                    />
                  ) : (
                    <BookmarkBorderIcon
                      className="recipe-details-save-icon"
                      onClick={handleSaveRecipe}
                      role="button"
                      aria-label="Save recipe"
                    />
                  )}
                </div>
                <h4 className="recipe-details-tags">{recipeTags}</h4>
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
                      username={username}
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
                            `${import.meta.env.VITE_BASE_URL}/comments/${commentId}`,
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
                            `${import.meta.env.VITE_BASE_URL}/comments/${commentId}`,
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
