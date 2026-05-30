"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser } from "@/features/auth";
import { getMe, login, updateCredentials as updateAuthCredentials, updateEmail } from "@/features/auth";

const TOKEN_KEY = "auth_token";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  updateCredentials: (payload: { email: string; currentPassword: string; password?: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      // Verify token validity
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  async function verifyToken(tokenToVerify: string) {
    try {
      const response = await getMe(tokenToVerify);
      setUser(response.user);
      setToken(tokenToVerify);
    } catch {
      // Token invalid or expired
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogin(email: string, password: string) {
    try {
      const response = await login({ email, password });
      const newToken = response.token;
      const sessionUser = extractSessionUser(response);

      setUser(sessionUser);
      setToken(newToken);
      localStorage.setItem(TOKEN_KEY, newToken);
    } catch (error) {
      throw error;
    }
  }

  function extractSessionUser(response: { user?: AuthUser; admin?: AuthUser }): AuthUser | null {
    return response.user ?? response.admin ?? null;
  }

  async function handleUpdateCredentials({ email, password, currentPassword }: { email: string; currentPassword: string; password?: string }) {
    try {
      const response = password
        ? await updateAuthCredentials({ email, password, currentPassword })
        : await updateEmail({ email, currentPassword });
      const newToken = response.token;
      const sessionUser = extractSessionUser(response);

      setUser(sessionUser);
      setToken(newToken);
      localStorage.setItem(TOKEN_KEY, newToken);
    } catch (error) {
      throw error;
    }
  }

  function handleLogout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  async function checkAuth(): Promise<boolean> {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    if (!currentToken) {
      return false;
    }

    try {
      const response = await getMe(currentToken);
      setUser(response.user);
      setToken(currentToken);
      return true;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      return false;
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login: handleLogin,
    updateCredentials: handleUpdateCredentials,
    logout: handleLogout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
