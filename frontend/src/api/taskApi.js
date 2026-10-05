import api from "./axios";

export const createTask = async (taskData, token) => {
  const response = await api.post("/api/task/create", taskData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getProjectTasks = async (projectId, token, params = {}) => {
  const response = await api.get(`/api/task/project/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });

  return response.data;
};

export const getDeletedProjectTasks = async (projectId, token, params = {}) => {
  const response = await api.get(`/api/task/project/${projectId}/deleted`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });

  return response.data;
};

export const getTask = async (taskId, token) => {
  const response = await api.get(`/api/task/${taskId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateTask = async (taskId, taskData, token) => {
  const response = await api.put(`/api/task/${taskId}`, taskData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const deleteTask = async (taskId, token) => {
  const response = await api.delete(`/api/task/${taskId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const restoreTask = async (taskId, token) => {
  const response = await api.patch(
    `/api/task/${taskId}/restore`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const updateTaskStatus = async (taskId, status, token) => {
  const response = await api.patch(
    `/api/task/${taskId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getMyTasks = async (token) => {
  const response = await api.get("/api/task/my-tasks", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getOverdueTasks = async (token) => {
  const response = await api.get("/api/task/overdue", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getTaskStats = async (token) => {
  const response = await api.get("/api/task/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getProjectTaskStats = async (projectId, token) => {
  const response = await api.get(`/api/task/stats/project/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
