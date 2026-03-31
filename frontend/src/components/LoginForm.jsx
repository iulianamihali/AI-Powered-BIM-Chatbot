import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/form.css";
import logo from '../assets/chat-icon.png'; 
import { API_URL} from './../services/config';
import { createConversation } from "../services/chatService";
const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const clientSecret = import.meta.env.VITE_AUTH0_CLIENT_SECRET;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
const realm = import.meta.env.VITE_AUTH0_REALM;

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.body.classList.add("form-page");
    return () => {
      document.body.classList.remove("form-page");
    };
  }, []);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return regex.test(email);
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateEmail(email)) {
        setErrorMessage("Please enter a valid email address.");
        return;
    }
    
    try {
      const response = await axios.post(`https://${domain}/oauth/token`, {
        grant_type: "password",
        username: email,
        password: password,
        audience: audience,
        client_id: clientId,
        client_secret: clientSecret,
        realm: realm
      }, {
        headers: { "Content-Type": "application/json" }
      });

      const token = response.data.access_token;

      if (rememberMe) {
        localStorage.setItem('authToken', token);
      } else {
        sessionStorage.setItem('authToken', token);
      }

      await axios.post(
        `${API_URL}/users/create_user`,
        {
          name: "New User",
          email: email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const userInfoResponse = await axios.get(`${API_URL}/users/me `, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userId = userInfoResponse.data.id;

      if (rememberMe) {
        localStorage.setItem("userId", userId);
      } else {
        sessionStorage.setItem("userId", userId);
      }


      const title = `Conversație nouă - ${new Date().toLocaleString()}`;
       const convResponse = await createConversation({ user_id: userId, title: title, sender: email});
      const conversationId = convResponse.id;
      navigate(`/chat/${conversationId}`);
            

    } catch (error) {
        console.error("Eroare la autentificare:", error.response?.data || error.message);
  
        if (error.response) {
          const code = error.response.data.error || "";
          const description = error.response.data.error_description || "";
  
          if (code === "invalid_grant") {
            setErrorMessage("Incorrect email or password.");
          } else {
            setErrorMessage(description || "Authentication error. Try again.");
          }
        } else {
          setErrorMessage("Server connection problem.");
        }
      }
    };

  return (
    <div className="page-container">
    <div className="logo-container">
    <img src={logo} alt="Logo" className="logo" />
    <span className="logo-text">DOSETIMPEX</span>
    </div>
    <div className="form-box">
      <h2>Log in to DOSETIMPEX</h2>
      <form onSubmit={handleLogin}>
      <div className="input-group">
            <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
        </div>
        <div className="options">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember Me
          </label>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <button type="submit">PROCEED</button>
      </form>
      <p>Don't have an account? <Link to="/signup"><b>Sign up</b></Link></p>
    </div>
    </div>
  );
}

export default LoginForm;
