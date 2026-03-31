import React, { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile, deleteUserAccount } from "../services/userService";
import "../styles/userProfile.css";
import TopbarUserProfile from "./TopbarUserProfile";
import axios from "axios";
import Sidebar from "./Sidebar.jsx";


const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const realm = import.meta.env.VITE_AUTH0_REALM;

function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",       
    phone: "",
    gender: "",
    language: "",
    country: "",
    company: "DOSETIMPEX",
  });
  const [passwordResetMessage, setPasswordResetMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);



  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUserProfile();
        console.log("User profile data received:", data);
        setUserData(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          gender: data.gender || "",
          language: data.language || "",
          country: data.country || "",
          company: "DOSETIMPEX",
        });
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    }

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const handleSave = async () => {
    try {
      const updated = await updateUserProfile(userData.id, {
        ...formData,
        company: "DOSETIMPEX", 
      });
      setUserData(updated);
      setEditMode(false);
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };
  

  const userInitial = formData.email?.charAt(0).toUpperCase();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      
      <div className="main-area profile-area">
        <TopbarUserProfile />
        <h1 className="profile-welcome">Welcome, {formData.name?.trim()}</h1>

        <div className="profile-header">
          <div className="profile-avatar">{userInitial}</div>
          <div className="profile-details">
            <span className="profile-name">{formData.name}</span>
            <span className="profile-email">{formData.email}</span>
          </div>
          <button className="edit-button" onClick={() => setEditMode(!editMode)}>
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>

          
          <form className="form-grid">
            {[
              { label: "Full Name", name: "name", placeholder: "Nume și prenume" },
              { label: "Phone Number", name: "phone", placeholder: "Număr de telefon" },
              { label: "Gender", name: "gender", placeholder: "Masculin" },
              { label: "Language", name: "language", placeholder: "Romana" },
              { label: "Country", name: "country", placeholder: "Romania" },
            ].map((field) => (
              <div key={field.name} className="form-group">
                <label>{field.label}</label>
                <input
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder={field.placeholder}
                />
              </div>
            ))}

              <div className="form-group">
              <label>Company</label>
              <input
                  name="company"
                  value="DOSETIMPEX"
                  disabled
                  readOnly
              />
              </div>
          </form>


          {editMode && (
          <button className="save-button" onClick={handleSave}>
              Save
          </button>
          )}

          {passwordResetMessage && (<p className="status-message">{passwordResetMessage}</p>)}
          {deleteMessage && (<p className="status-message">{deleteMessage}</p>)}

          <div className="account-actions">
            <button
              className="reset-password-btn"
              onClick={async () => {
                setPasswordResetMessage(""); 
                try {
                  await axios.post(`https://${domain}/dbconnections/change_password`, {
                    client_id: clientId,
                    email: formData.email,
                    connection: realm
                  }, {
                    headers: { "Content-Type": "application/json" }
                  });
              
                  setPasswordResetMessage("Password reset email has been sent!");
                } catch (err) {
                  console.error(err);
                  setPasswordResetMessage("There was an error sending the email.");
                }
              }}
            >
              Reset Password
            </button>


            <button
              className="delete-account-btn"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </button>

          </div>

          {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <p>Are you sure you want to delete your account?</p>
              <div className="modal-buttons">
                <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button
                  onClick={async () => {
                    try {
                      const result = await deleteUserAccount();
                      setDeleteMessage(result.message || "The account was successfully deleted.");
                      setShowDeleteModal(false);
                      localStorage.clear();
                      sessionStorage.clear();
                      setTimeout(() => {
                        window.location.href = "/login";
                      }, 2000);
                    } catch (err) {
                      console.error(err);
                      setDeleteMessage("An error occurred when deleting the account.");
                      setShowDeleteModal(false);
                    }
                  }}
                >
                  Yes, delete the account
                </button>
              </div>
            </div>
          </div>
          )}


          <button
          className="logout-button"
          onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = "/login";
          }}
          >
          Disconnect
          </button>
        </div>
    </div>
  );
  
}

export default UserProfile;
