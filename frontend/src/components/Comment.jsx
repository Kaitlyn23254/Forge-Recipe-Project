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
  onReplyEdit = async () => {},
  onReplyDelete = async () => {},
  currentUserId = null,
  commentUserId = null,
  onCommentEdit = async () => {},
  onCommentDelete = async () => {},
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text || "");

  const isOwn =
    commentUserId && currentUserId && commentUserId === currentUserId;

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) {
      return;
    }

    await onReplySubmit(id, replyText);
    setReplyText("");
    setIsReplying(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    await onCommentEdit(id, editText);
    setIsEditing(false);
  };

  return (
    <div className="comment">
      <div className="comment-header">
        <p className="comment-username">{username}</p>
        <p>{createdAt}</p>
      </div>
      <div className="comment-body">
        {isEditing ? (
          <form className="comment-edit-form" onSubmit={handleSaveEdit}>
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <button className="editing-save-btn" type="submit">
              Save
            </button>
            <button
              className="editing-cancel-btn"
              type="button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </form>
        ) : (
          <p>{text}</p>
        )}
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
        {isOwn && !isEditing ? (
          <>
            <button
              className="comment-edit-button"
              type="button"
              onClick={() => {
                setEditText(text);
                setIsEditing(true);
              }}
            >
              Edit
            </button>
            <button
              className="comment-delete-button"
              type="button"
              onClick={() => onCommentDelete(id)}
            >
              Delete
            </button>
          </>
        ) : null}
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
              handleReplyEdit={(replyId, newText) =>
                onReplyEdit(id, replyId, newText)
              }
              handleReplyDelete={() => onReplyDelete(id, reply.id)}
              isOwn={reply.userId === currentUserId}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
