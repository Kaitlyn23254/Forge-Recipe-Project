import { useState, useEffect } from "react";
import axios from "axios";
import IngredientsList from "../components/IngredientsList";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { timestampToString } from "../utility/timestampToString";

import "../styles/RecipeDetails.css";
import CommentSection from "../components/CommentSection";
import Comment from "../components/Comment";

const userId = "X7CtVm0P6YeWybH4ZL75";
const recipeId = "4mHCcLEftQemlwQ2Zydn";
const commentRating = "3";
const username = "johnbob";

export default function RecipeDetails() {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/comments`,
        {
          recipeId,
          userId,
          text: commentText,
          rating: commentRating,
        },
      );

      const newComment = response.data;
      setComments((prevComments) => [
        ...prevComments,
        { ...newComment, replies: [] },
      ]);
      setCommentText("");
    } catch (err) {
      console.log("Error posting comment: ", err);
    }
  };

  useEffect(() => {
    fetchCommentsWithReplies().catch((err) => {
      console.error("Error fetching comments: ", err);
    });
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

  const recipeImageUrl = null;
  const recipeTitle = "Eggs and Ham";
  const recipeTags = "Meat, eggs, breakfast";
  const recipeInstructions = [
    "Place a large skillet over medium heat and add the olive oil.",
    "Saute the onion and garlic for 2 to 3 minutes until fragrant.",
    "Add the carrots and cook for 5 minutes, stirring occasionally.",
    "Crack in the eggs and gently stir until set to your preferred texture.",
    "Season to taste and serve immediately while warm.",
  ];
  const mockIngredients = [
    { ingredient: "carrot", measurement: "3.4 cup" },
    { ingredient: "onion", measurement: "1 large" },
    { ingredient: "garlic", measurement: "2 cloves" },
    { ingredient: "olive oil", measurement: "2 tbsp" },
  ];

  return (
    <div className="recipe-details">
      <div className="recipe-details-left">
        <div className="recipe-details-header">
          {recipeImageUrl ? (
            <img src={recipeImageUrl} alt={`Picture of ${recipeTitle}`} />
          ) : null}
          <div className="recipe-details-header-text">
            <div className="recipe-details-header-title-row">
              <h1 className="recipe-details-title">{recipeTitle}</h1>
              <BookmarkBorderIcon />
            </div>
            <h4 className="recipe-details-tags">{recipeTags}</h4>
          </div>
        </div>

        <div className="recipe-details-instructions-container">
          <h2 className="recipe-details-instructions-title">Instructions</h2>
          <ol>
            {recipeInstructions.map((instruction, idx) => (
              <li key={`${idx}-${instruction}`}>{instruction}</li>
            ))}
          </ol>
        </div>
        <CommentSection
          commentText={commentText}
          setCommentText={setCommentText}
          handleSubmit={handleSubmit}
        />
        {comments.map((c) => (
          <Comment
            key={c.id ?? `${c.text}-${c.createdAt?.seconds ?? "unknown"}`}
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
            onCommentEdit={async (commentId, newText) => {
              try {
                const resp = await axios.patch(
                  `${import.meta.env.VITE_BASE_URL}/comments/${commentId}`,
                  { userId, text: newText },
                );

                const updated = resp?.data;

                setComments((prevComments) =>
                  prevComments.map((comment) =>
                    comment.id === commentId ? { ...comment, ...updated } : comment,
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

                setComments((prevComments) => prevComments.filter((c) => c.id !== commentId));
              } catch (err) {
                console.log("Error deleting comment: ", err);
              }
            }}
          />
        ))}
      </div>

      <div className="recipe-details-right">
        <IngredientsList ingredients={mockIngredients} />
      </div>
    </div>
  );
}
