export default function CommentSection({
  commentText,
  setCommentText,
  handleSubmit,
}) {
  return (
    <>
      <h2>Comments</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="recipe-detail-input"
          onChange={(e) => setCommentText(e.target.value)}
          value={commentText}
          placeholder="Leave a comment..."
        />
        <button type="submit">Comment</button>
      </form>
    </>
  );
}
