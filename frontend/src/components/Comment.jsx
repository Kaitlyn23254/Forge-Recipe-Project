import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";

import "./styles/Comment.css";

export default function Comment({
  id,
  username,
  text,
  createdAt,
  numLikes,
  likedByUser,
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
        {likedByUser ? (
          <ThumbUpIcon onClick={() => handleCommentLike(id)} />
        ) : (
          <ThumbUpOffAltIcon onClick={() => handleCommentLike(id)} />
        )}
        <span>{numLikes}</span>
      </div>
      <p></p>
    </div>
  );
}
