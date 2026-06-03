export default function ChatMessage({ role, content }) {
  return (
    <div className="chat-message">
      <p
        className={`chat-message-content ${role === "user" ? "role-user" : ""}`}
      >
        {content}
      </p>
    </div>
  );
}
