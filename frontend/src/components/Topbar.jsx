import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { createConversation } from "../services/chatService";
import { getUserProfile } from "../services/userService";

function Topbar() {
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const main = document.querySelector(".main-area");
    if (main) {
      if (darkMode) {
        main.classList.remove("light-mode");
      } else {
        main.classList.add("light-mode");
      }
    }
  }, [darkMode]);
  

  const handleNewChat = async () => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const userEmail = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
  
    if (!token) {
      console.error("Token lipsește.");
      return;
    }
  
  
    try {
    const user = await getUserProfile();
    const userId = user.id;  
       
      console.log(userId)
     const response = await createConversation({
        user_id: userId,
        title: `Conversație nouă - ${new Date().toLocaleString()}`,
        sender: userId
      
      });

  
      const conversationId = response.conversation_id || response.id; 
      if (!conversationId) {
        console.error("conversation_id lipsă în răspuns");
        return;
      }
  
      navigate(`/chat/${conversationId}`);


    } catch (error) {
      console.error("Eroare la crearea conversației:", error);
    }
  };
  
  

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="topbar">
      <div className="toggle-switch" onClick={toggleTheme}>
        <div className={`switch-circle ${darkMode ? "left" : "right"}`}></div>
      </div>
    </div>
  );
}

export default Topbar;
