import api from "./axios";

export const getTaskStats = async (token) => {
  const response = await api.get("/api/task/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
