import axios from "axios";
import { API_URL} from './config';

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  console.log("token "+localStorage.getItem("authToken"));
  return { Authorization: `Bearer ${token}` };
};


const chatService = {
  getChatsByUserId: async (userId) => {
    const res = await fetch(`${API_URL}/conversations/all_conversations/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.json();
  },

  getMessagesByConversationId: async (conversationId) => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
 
    const res = await fetch(`${API_URL}/message/all_conversation/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  },

  addChat: async ({ user_id, title, sender }) => {
    const res = await fetch(`${API_URL}/conversations/add_conversation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ user_id, title, sender }),
    });
    console.log("json add chat "+ res);
    console.log("json add chat "+ res.sender);

    return res.json();
  },
};

export const sendMessage = async (conversationId, message) => {
  console.log("➡ API_URL:", API_URL);
    const response = await axios.post(`${API_URL}/chat_response`, { message }, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    const botAnswer = response.data.response;
    const user = await getUserProfile();

    await addMessageToDB(conversationId, user.email, message);

    
  
    return { answer: botAnswer };
  };

  export const addMessageToDB = async (conversation_id, sender, content) => {
    console.log("Trimitem spre backend:", { conversation_id, sender, content });

    const response = await axios.post(`${API_URL}/message/add_message`, {
      conversation_id,
      sender,
      content,
    }, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    return response.data; 
  };

export const getConversationHistory = async () => {
  const user = await getUserProfile();
  getUserProfile().then(console.log).catch(console.error);

  const response = await axios.get(`${API_URL}/conversations/all_conversations/${user.id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const searchMessages = async (query) => {
  const response = await axios.get(`${API_URL}/conversations/search`, {
    params: { q: query },
    headers: getAuthHeader()
  });
  return response.data;
};

export const getUserProfile = async () => {  //aici am modif me cu profile
  const response = await axios.get(`${API_URL}/users/me`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const createConversation = async (data) => {
    const response = await axios.post(`${API_URL}/conversations/add_conversation`, data, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    
    return response.data;
  };

  export const uploadFile = async (file) => {
    try {
    const user = await getUserProfile(); // ia user-ul curent
    const userId = user.id;

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_URL}/message/upload-file/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      return { extractedText: response.data.bot_response };;
    } catch (error) {
      console.error("Eroare upload:", error.response?.data?.error || error.message);
      return { extractedText: "[Eroare] Nu s-a putut procesa fișierul." };
    }
  };

export const updateConversationTitle = async (id, title) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    console.log("token "+token);
    const { data } = await axios.put(
        `${API_URL}/conversations/edit/${id}`,
        { title},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
    );
    return data;
  } catch (err) {
    console.error("Edit failed:", err.response?.data || err.message);
    throw err;
  }
};

export const deleteConversation = async id => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const { data } = await axios.delete(
        `${API_URL}/conversations/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (err) {
    console.error("Delete failed:", err.response?.data || err.message);
    throw err;
  }
};

export default chatService;


