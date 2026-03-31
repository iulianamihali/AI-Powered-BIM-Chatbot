import { useState } from "react";
import "../styles/dashboard.css";

function Chats() {
  const [conversations] = useState([]); 

  return (
    <div className="page-container">
      <h2>Istoric conversații</h2>
      <ul className="chat-history-list">
        {conversations.length > 0 ? (
          conversations.map((conv, idx) => (
            <li key={idx}>
              <p><strong>{conv.timestamp}</strong></p>
              <p>{conv.preview || "Fără conținut"}</p>
            </li>
          ))
        ) : (
          <p>Nu există conversații de afișat</p>
        )}
      </ul>
    </div>
  );
}

export default Chats;
