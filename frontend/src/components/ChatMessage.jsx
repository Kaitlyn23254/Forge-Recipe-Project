export default function ChatMessage({ role, content }) {
  const isUser = role === "user";

  return (
    <div
      className={`chat-message ${isUser ? "chat-message--user" : "chat-message--assistant"}`}
    >
      <p className="chat-message__content">{content}</p>
    </div>
  );
}
