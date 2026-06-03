import axios from "axios";
import { useState } from "react";
import ChatMessage from "./ChatMessage";

export default function ChatBox({
  recipeTitle,
  recipeInstructions,
  recipeIngredients,
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newMessage = inputText.trim();

    if (!newMessage) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: newMessage }];

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/chat`,
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
    }
  };

  return (
    <div className="chat-box-container">
      <h1>Chef Cook-A-Lot</h1>

      <div className="chat-messages-container">
        {messages.map((m, index) => (
          <ChatMessage
            key={`${m.role}-${index}`}
            content={m.content}
            role={m.role}
          />
        ))}
      </div>

      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      ></input>
      <button className="chat-box-send-btn" onClick={handleSubmit}>
        Send
      </button>
    </div>
  );
}
