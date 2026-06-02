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
      setComments((prevComments) => [...prevComments, newComment]);
      setCommentText("");
    } catch (err) {
      console.log("Error posting comment: ", err);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/comments/${recipeId}`,
        );

        console.log("Response useEffect data is: ", response.data);

        setComments(response.data);
      } catch (err) {
        console.error("Error fetching comments: ", err);
      }
    };

    fetchComments();
  }, []);

  const handleCommentLike = async (commentId) => {
    try {
      const postResp = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/comments/${commentId}/like`,
        { userId },
      );

      const updatedLikes = postResp?.data?.likes;

      setComments((prevComments) =>
        prevComments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                likeCount:
                  typeof updatedLikes === "number"
                    ? updatedLikes
                    : (c.likeCount || 0) + 1,
              }
            : c,
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
            createdAt={timestampToString(c.createdAt)}
            handleCommentLike={handleCommentLike}
          />
        ))}
      </div>

      <div className="recipe-details-right">
        <IngredientsList ingredients={mockIngredients} />
      </div>
    </div>
  );
}
