import { useState } from "react";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";

import "./styles/Comment.css";
import Reply from "./Reply";

export default function Comment({
  id,
  username,
  text,
  createdAt,
  numLikes,
  likedByUser,
  handleCommentLike,
  replies = [],
  onReplySubmit = async () => {},
  onReplyLike = async () => {},
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) {
      return;
    }

    await onReplySubmit(id, replyText);
    setReplyText("");
    setIsReplying(false);
  };

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
        <button
          className="comment-reply-button"
          type="button"
          onClick={() => setIsReplying((current) => !current)}
        >
          Reply
        </button>
      </div>

      {isReplying ? (
        <form className="comment-reply-form" onSubmit={handleReplySubmit}>
          <input
            name={`reply-input-${id}`}
            onChange={(e) => setReplyText(e.target.value)}
            value={replyText}
            placeholder="Write a reply..."
          />
          <button type="submit">Reply</button>
        </form>
      ) : null}

      {replies.length > 0 ? (
        <div className="comment-replies">
          {replies.map((reply) => (
            <Reply
              key={reply.id}
              id={reply.id}
              username={username}
              text={reply.text}
              createdAt={reply.createdAt}
              numLikes={reply.likeCount ?? 0}
              likedByUser={reply.likedByUser ?? false}
              handleReplyLike={() => onReplyLike(id, reply.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
