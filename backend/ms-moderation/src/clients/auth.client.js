const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://auth-service:3003/api/auth";

const requestAuthService = async ({ path, method, token, body }) => {
  const response = await fetch(`${AUTH_SERVICE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || data.error || "Error en ms-auth");
    error.status = response.status;
    throw error;
  }

  return data.data || data;
};

const suspendUser = async ({ authId, suspendedUntil, reason, token }) => {
  return requestAuthService({
    path: `/admin/users/${authId}/suspend`,
    method: "PATCH",
    token,
    body: {
      suspendedUntil,
      reason
    }
  });
};

const banUser = async ({ authId, reason, token }) => {
  return requestAuthService({
    path: `/admin/users/${authId}/ban`,
    method: "PATCH",
    token,
    body: {
      reason
    }
  });
};

module.exports = {
  suspendUser,
  banUser
};
