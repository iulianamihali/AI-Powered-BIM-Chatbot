import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/form.css";
import logo from "../assets/chat-icon.png";

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const realm = import.meta.env.VITE_AUTH0_REALM;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); 

  useEffect(() => {
    document.body.classList.add("form-page");
    return () => {
      document.body.classList.remove("form-page");
    };
  }, []);
  

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`https://${domain}/dbconnections/change_password`, {
        client_id: clientId, 
        email: email,
        connection: realm
      }, {
        headers: { "Content-Type": "application/json" }
      });

      setMessage("Reset email has been sent! Check your inbox.");

    } catch (error) {
      console.error(error.response?.data || error.message);
      setMessage("An error has occurred. Check your email address and try again.");
    }
  };

  return (
    <div className="page-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
        <span className="logo-text">BIM</span>
      </div>
  
      <div className="form-box">
        <h2>Reset your password</h2>
  
        <form onSubmit={handleResetPassword}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {message && <p className="error-message">{message}</p>}
          <button type="submit">SEND RESET EMAIL</button>
        </form>
  
        
  
        <p>Back to <Link to="/login"><b>Login</b></Link></p>
      </div>
    </div>
  );
  
}

export default ForgotPassword;
