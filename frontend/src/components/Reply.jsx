import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { timestampToString } from "../utility/timestampToString";

export default function Reply({
  id,
  username,
  text,
  createdAt,
  numLikes,
  likedByUser,
  handleReplyLike,
}) {
  return (
    <div className="reply">
      <div className="reply-header">
        <p className="reply-username">{username}</p>
        <p>{timestampToString(createdAt)}</p>
      </div>
      <p className="reply-body">{text}</p>
      <div className="reply-footer">
        {likedByUser ? (
          <ThumbUpIcon onClick={() => handleReplyLike(id)} />
        ) : (
          <ThumbUpOffAltIcon onClick={() => handleReplyLike(id)} />
        )}
        <span>{numLikes}</span>
      </div>
    </div>
  );
}
