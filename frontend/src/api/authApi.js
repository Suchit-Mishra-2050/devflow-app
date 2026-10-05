import api from "./axios";

export const registerUser = async (userData) => {
  const response = await api.post("/api/user/register", userData);

  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/api/user/login", userData);

  return response.data;
};

export const getProfile = async (token) => {
  const response = await api.get("/api/user/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateProfile = async (token, userData) => {
  const response = await api.put("/api/user/profile", userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
