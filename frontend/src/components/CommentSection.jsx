export default function CommentSection({
  commentText,
  setCommentText,
  handleSubmit,
}) {
  return (
    <>
      <h3>Comments</h3>
      <form onSubmit={handleSubmit}>
        <input
          name="recipe-detail-input"
          onChange={(e) => setCommentText(e.target.value)}
          value={commentText}
        />
        <button type="submit">Comment</button>
      </form>
    </>
  );
}
