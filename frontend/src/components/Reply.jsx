import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { timestampToString } from "../utility/timestampToString";
import { useState } from "react";

import "./styles/Comment.css";

export default function Reply({
  id,
  username,
  text,
  createdAt,
  numLikes,
  likedByUser,
  handleReplyLike,
  handleReplyEdit = async () => {},
  handleReplyDelete = async () => {},
  isOwn = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text || "");

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    await handleReplyEdit(id, editText);
    setIsEditing(false);
  };
  return (
    <div className="reply">
      <div className="reply-header">
        <p className="reply-username">{username}</p>
        <p>{timestampToString(createdAt)}</p>
      </div>
      {isEditing ? (
        <form className="reply-edit-form" onSubmit={saveEdit}>
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
        <>
          <p className="reply-body">{text}</p>
          <div className="reply-footer">
            {likedByUser ? (
              <ThumbUpIcon
                className="comment-footer__icon"
                onClick={() => handleReplyLike(id)}
              />
            ) : (
              <ThumbUpOffAltIcon
                className="comment-footer__icon"
                onClick={() => handleReplyLike(id)}
              />
            )}
            <span>{numLikes}</span>
            {isOwn ? (
              <>
                <button
                  className="reply-edit"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
                <button
                  className="reply-delete"
                  onClick={() => handleReplyDelete(id)}
                >
                  Delete
                </button>
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
