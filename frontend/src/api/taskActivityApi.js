import api from "./axios";

export const getTaskActivities = async (taskId, token, params = {}) => {
  const response = await api.get(`/api/task-activity/task/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};
