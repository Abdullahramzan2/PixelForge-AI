"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchMe, login as loginRequest, signup as signupRequest } from "@/lib/api";
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
  storeAuth,
} from "@/lib/auth-storage";
import type { LoginPayload, SignupPayload, User } from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      return;
    }

    const currentUser = await fetchMe(storedToken);
    storeAuth(storedToken, currentUser);
    setToken(storedToken);
    setUser(currentUser);
  }, []);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    setUser(storedUser);

    fetchMe(storedToken)
      .then((currentUser) => {
        storeAuth(storedToken, currentUser);
        setUser(currentUser);
      })
      .catch(() => {
        clearAuth();
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload);
    storeAuth(response.access_token, response.user);
    setToken(response.access_token);
    setUser(response.user);
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    const response = await signupRequest(payload);
    storeAuth(response.access_token, response.user);
    setToken(response.access_token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
