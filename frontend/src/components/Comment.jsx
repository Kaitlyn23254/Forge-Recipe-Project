import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";

import "./styles/Comment.css";

export default function Comment({
  id,
  username,
  text,
  createdAt,
  numLikes,
  handleCommentLike,
}) {
  return (
    <div className="comment">
      <div className="comment-header">
        <p className="comment-username">{username}</p>
        <p>{createdAt}</p>
      </div>
      <div className="comment-body">
        <p>{text}</p>
      </div>
      <div className="comment-footer">
        <ThumbUpOffAltIcon onClick={() => handleCommentLike(id)} />
        <span>{numLikes}</span>
      </div>
      <p></p>
    </div>
  );
}
