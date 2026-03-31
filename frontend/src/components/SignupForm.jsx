import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/form.css";
import logo from '../assets/chat-icon.png';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const realm = import.meta.env.VITE_AUTH0_REALM;

function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.body.classList.add("form-page");
    return () => {
      document.body.classList.remove("form-page");
    };
  }, []);
  

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    return password.length >= minLength && hasUpperCase && hasNumber;
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return regex.test(email);
  };
  

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage(""); 

    if (!validatePassword(password)) {
      setErrorMessage("The password is too weak.");
      return;
    }

    if (!validateEmail(email)) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }
      
    try {
      await axios.post(`https://${domain}/dbconnections/signup`, {
        client_id: clientId,
        email: email,
        password: password,
        connection: realm
      }, {
        headers: { "Content-Type": "application/json" }
      });

      navigate("/login");

    } catch (error) {
      console.error(error.response?.data || error.message);
      if (error.response) {
        const data = error.response.data;
        const code = data.error || data.code || data.errorCode || "";
        const description = data.description || data.message || "";
    
        if (
            code === "user_exists" ||
            description.toLowerCase().includes("already exists") ||
            (code === "invalid_signup" && description.toLowerCase().includes("invalid sign up"))
          ) {
            setErrorMessage("This email is already in use.");
        } else if (description.toLowerCase().includes("password")) {
          setErrorMessage("The password is too weak.");
        } else if (description.toLowerCase().includes("invalid")) {
          setErrorMessage("Email or password invalid.");
        } else {
          setErrorMessage("Account creation error. Try again.");
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
        <h2>Sign up to DOSETIMPEX</h2>
        <form onSubmit={handleSignup}>
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
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <button type="submit">CREATE AN ACCOUNT</button>
        </form>
        <p>Already have an account? <Link to="/login"><b>Log in</b></Link></p>
      </div>
    </div>
  );  
}

export default SignupForm;
