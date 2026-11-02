import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../services/auth.service";

import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
} from "../utils/auth.utils";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    () => getStoredToken()
  );

  const [loading, setLoading] = useState(true);

  // Restore user session on application startup
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        if (active) {
          setLoading(false);
        }

        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (active) {
          setUser(currentUser);
          setToken(storedToken);
        }
      } catch (error) {
        clearStoredToken();

        if (active) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  // Register
  const register = useCallback(async (userData) => {
    return registerUser(userData);
  }, []);

  // Login
  const login = useCallback(async (credentials) => {
    const result = await loginUser(credentials);

    if (!result.token || !result.user) {
      throw new Error(
        "Invalid login response: expected user and access token."
      );
    }

    setStoredToken(result.token);

    setToken(result.token);
    setUser(result.user);

    return result.user;
  }, []);

  // Refresh authenticated user data
  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser();

    setUser(currentUser);

    return currentUser;
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (getStoredToken()) {
        await logoutUser();
      }
    } finally {
      clearStoredToken();

      setToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,

      isAuthenticated: Boolean(user && token),

      register,
      login,
      logout,
      refreshUser,
    }),
    [
      user,
      token,
      loading,
      register,
      login,
      logout,
      refreshUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};