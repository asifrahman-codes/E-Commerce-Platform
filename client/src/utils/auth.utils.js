export const TOKEN_KEY = "accessToken";

export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token) => {
  if (!token) return;

  localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const normalizeRole = (role) => {
  return String(role || "").trim().toLowerCase();
};

export const hasRole = (user, allowedRoles = []) => {
  if (!user || !Array.isArray(allowedRoles)) {
    return false;
  }

  const userRole = normalizeRole(user.role);

  return allowedRoles.some(
    (role) => normalizeRole(role) === userRole
  );
};