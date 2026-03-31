import { useState, useEffect } from "react";
import { createConversation, sendMessage, uploadFile, getUserProfile } from "../services/chatService";
import { useNavigate } from "react-router-dom";
import chatService from "../services/chatService";


function ChatWindow({ conversationId }) {
  const navigate = useNavigate();

   const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingIndex, setLoadingIndex] = useState(0);
  

  useEffect(() => {
    if (!conversationId || conversationId === "new") {
      setMessages([]);
      return;
    }
  
    async function fetchMessages() {
      try {
        const data = await chatService.getMessagesByConversationId(conversationId);
        const messagesWithSender = (data || []).map(msg => ({
          sender: msg.role || msg.sender || "user", 
          content: msg.content,
        }));
  
        setMessages(messagesWithSender);
      } catch (error) {
        console.error(error);
        setMessages([]);
      }
    }
  
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    const messagesDuringLoading = [
      "Se caută răspunsuri...",
      "Se analizează datele...",
      "Se generează rezultatul...",
      "Gândim puțin mai mult...",
    ];
  
    if (!loading) {
      setLoadingMessage("");
      setLoadingIndex(0);
      return;
    }
  
    setLoadingMessage(messagesDuringLoading[0]);
  
    const interval = setInterval(() => {
      setLoadingIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % messagesDuringLoading.length;
        setLoadingMessage(messagesDuringLoading[nextIndex]);
        return nextIndex;
      });
    }, 3000);
  
    return () => clearInterval(interval);
  }, [loading]);
  

  const createNewConversation = async () => {
    try {
      const user = await getUserProfile(); 
      const title = `Conversație nouă - ${new Date().toLocaleString()}`;
      const sender = user.email || "Unknown";
   
      const response = await createConversation({ user_id: user.id,title, sender }); 
      const newConversationId = response.id;
      console.log("response ", response);
      console.log(newConversationId)

      setMessages([]);
      setInput("");
      setConversations(prev => [response, ...prev]);

      navigate(`/chat/${newConversationId}`);

    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (input.trim() === "" && !selectedFile) return;
    const userMessages = [...messages];

    if (selectedFile) {
      const fileNameMessage = {
        sender: "user",
        content: `📎 Fișier încărcat: **${selectedFile.name}**`,
      };
      setMessages([...userMessages, fileNameMessage]);
      setInput("");
      setLoading(true);

      const uploadResult = await uploadFile(selectedFile, conversationId);
      

      const botFileMsg = {
        sender: "bot",
        content: uploadResult.extractedText || "Nu s-a putut extrage textul din fișier.",
      };
      setMessages([...userMessages, fileNameMessage, botFileMsg]);
      setSelectedFile(null);
      setInput("");
      setLoading(false);
      return;
    }


    const userMessage = { sender: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

   
    const response = await sendMessage(conversationId, input);
    setLoading(false);
    const botMessage = { sender: "bot", content: response.answer };
    setMessages([...updatedMessages, botMessage]);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="chat-window">
       <button className="chat-btn" onClick={createNewConversation} style={{ marginBottom: "10px" }}>
      + New Chat
    </button>

      {isEmpty ? (
        <div className="chat-empty-state">
          <p className="chat-welcome-message">
            Salut! Scrie un mesaj pentru a începe conversația.
          </p>
          <div className="chat-input">
            <label htmlFor="file-upload" className="file-upload-btn">+</label>
            <input
              id="file-upload"
              type="file"
              accept=".docx"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedFile(file);
                  setInput(`Fișier încărcat: ${file.name}`);
                }
              }}
            />


            <input
              type="text"
              placeholder="Type '/' for commands"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim() !== "" && !loading) {
                  handleSend();
                }
              }}              
            />
            <button onClick={handleSend} disabled={loading}>&uarr;</button>
          </div>
        </div>
      ) : (
        <>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div className={`chat-message ${msg.sender}`} key={idx}>
                <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
              </div>
            ))}
              {loading && (
  <div className="chat-message bot">
    <p style={{ fontStyle: "italic", color: "gray" }}>
      {loadingMessage}
    </p>
  </div>
)}
          </div>
        

          <div className="chat-input">
            <label htmlFor="file-upload" className="file-upload-btn">+</label>
            <input
              id="file-upload"
              type="file"
              accept=".docx"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedFile(file);
                  setInput(`📎 Fișier încărcat: **${file.name}**`);
                }
              }}
              
            />

            <input
              type="text"
              placeholder="Type '/' for commands"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim() !== "" && !loading) {
                  handleSend();
                }
              }}              
            />
            <button onClick={handleSend} disabled={loading}>&uarr;</button>
          </div>


        </>
      )}
    </div>
  );
}

export default ChatWindow;
