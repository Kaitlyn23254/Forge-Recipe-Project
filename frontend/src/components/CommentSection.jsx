import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";

import "./styles/Comment.css";

export default function CommentSection({
  commentText,
  setCommentText,
  handleSubmit,
  rating,
  setRating,
}) {
  return (
    <div className="comment-section recipe-details-panel">
      <h2 className="comment-section__title recipe-details-panel__title">
        Comments
      </h2>
      <form className="comment-section__form" onSubmit={handleSubmit}>
        <input
          className="comment-section__input"
          name="recipe-detail-input"
          onChange={(e) => setCommentText(e.target.value)}
          value={commentText}
          placeholder="Leave a comment..."
        />
        <button className="comment-section__submit" type="submit">
          Comment
        </button>
      </form>
      <div className="comment-section__rating">
        <Typography variant="body2" component="span" className="comment-section__rating-label">
          Rating (optional)
        </Typography>
        <Rating
          name="comment-rating"
          value={rating ?? null}
          precision={0.5}
          max={5}
          onChange={(_, value) => setRating(value)}
        />
      </div>
    </div>
  );
}
