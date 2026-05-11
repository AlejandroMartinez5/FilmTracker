const USERS_SERVICE_URL =
  process.env.USERS_SERVICE_URL || "http://user-service:3002/api/users";

const requestUsersService = async ({ path, method, token }) => {
  const response = await fetch(`${USERS_SERVICE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Error en ms-users");
    error.status = response.status;
    throw error;
  }

  return data.data || data;
};

const removeProfilePhoto = async ({ authId, token }) => {
  return requestUsersService({
    path: `/admin/users/${authId}/profile-photo`,
    method: "DELETE",
    token
  });
};

const getPublicProfile = async ({ authId, token }) => {
  const data = await requestUsersService({
    path: `/id/${authId}`,
    method: "GET",
    token
  });

  return data;
};

module.exports = {
  getPublicProfile,
  removeProfilePhoto
};
