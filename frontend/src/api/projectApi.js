import api from "./axios";

export const createProject = async (projectData, token) => {
  const response = await api.post("/api/project/create", projectData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getOrganizationProjects = async (organizationId, token) => {
  const response = await api.get(
    `/api/project/organization/${organizationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getProject = async (projectId, token) => {
  const response = await api.get(`/api/project/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateProject = async (projectId, projectData, token) => {
  const response = await api.put(`/api/project/${projectId}`, projectData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const deleteProject = async (projectId, token) => {
  const response = await api.delete(`/api/project/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const addProjectMember = async (projectId, email, token) => {
  const response = await api.post(
    `/api/project/${projectId}/member`,
    { email },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const removeProjectMember = async (projectId, email, token) => {
  const response = await api.delete(`/api/project/${projectId}/member`, {
    data: { email },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getProjectMembers = async (projectId, token) => {
  const response = await api.get(`/api/project/${projectId}/members`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
