import axios from "axios";
import { useState } from "react";
import { API_BASE_URL } from "../utility/api";
import ChatMessage from "./ChatMessage";

import "./styles/ChatBox.css";

const WELCOME_MESSAGE =
  "Hi! I'm Chef Cook-A-Lot. I'm here to help you with any questions regarding this recipe, just let me know what you need!";

export default function ChatBox({
  recipeTitle,
  recipeInstructions,
  recipeIngredients,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newMessage = inputText.trim();

    if (!newMessage) {
      setLoading(false);
      return;
    }

    const nextMessages = [...messages, { role: "user", content: newMessage }];

    try {
      setError("");
      const response = await axios.post(
        `${API_BASE_URL}/chat`,
        {
          messages: nextMessages,
          recipeInstructions,
          recipeTitle,
          recipeIngredients,
        },
      );

      console.log("Response is: ", response);

      const assistantReply = response.data?.output_text ?? "";

      setMessages([
        ...nextMessages,
        { role: "assistant", content: assistantReply },
      ]);
      setInputText("");
    } catch (err) {
      console.error("Error making request on frontend: ", err);
      const message =
        err.response?.data?.error ||
        "Unable to reach the cooking assistant right now.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-details-panel chat-box">
      <h2 className="chat-box__title">Chef Cook-A-Lot</h2>

      <div className="chat-box__messages">
        <ChatMessage role="assistant" content={WELCOME_MESSAGE} />
        {messages.map((m, index) => (
          <ChatMessage
            key={`${m.role}-${index}`}
            content={m.content}
            role={m.role}
          />
        ))}
      </div>

      {error ? <p className="chat-box__error">{error}</p> : null}

      <form className="chat-box__form" onSubmit={handleSubmit}>
        <input
          className="chat-box__input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about this recipe..."
        />
        <button className="chat-box__send" type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}
