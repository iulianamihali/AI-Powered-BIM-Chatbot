import axios from "axios";

import { API_URL} from './config';

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  return { Authorization: `Bearer ${token}` };
};

export const getUserProfile = async () => {
  const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
  
  const response = await axios.get(`${API_URL}/users/profile/${userId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
};

export const updateUserProfile = async (id, data) => {
  const response = await axios.put(`${API_URL}/users/update_user/${id}`, data, {
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const deleteUserAccount = async () => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  const response = await axios.delete(`${API_URL}/users/delete_me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};
