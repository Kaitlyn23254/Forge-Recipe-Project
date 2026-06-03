import "./styles/Comment.css";

export default function CommentSection({
  commentText,
  setCommentText,
  handleSubmit,
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
    </div>
  );
}
