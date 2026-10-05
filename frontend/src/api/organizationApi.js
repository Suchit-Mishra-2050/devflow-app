import api from "./axios";

export const createOrganization = async (organizationData, token) => {
  const response = await api.post(
    "/api/organization/create",
    organizationData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getMyOrganizations = async (token) => {
  const response = await api.get("/api/organization/my-organizations", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getOrganization = async (organizationId, token) => {
  const response = await api.get(`/api/organization/${organizationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const addOrganizationMember = async (
  organizationId,
  email,
  role,
  token,
) => {
  const response = await api.post(
    "/api/organization/add-member",
    {
      organizationId,
      email,
      role,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const removeOrganizationMember = async (
  organizationId,
  email,
  token,
) => {
  const response = await api.delete(
    `/api/organization/${organizationId}/member`,
    {
      data: {
        email,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const changeMemberRole = async (organizationId, email, role, token) => {
  const response = await api.put(
    `/api/organization/${organizationId}/member-role`,
    {
      email,
      role,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
