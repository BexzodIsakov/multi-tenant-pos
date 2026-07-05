import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { API_BASE_URL } from "../api/config";
import { setAccessToken as setStoredAccessToken } from "../api/tokenStore";
import { decodeAccessToken } from "../utils/jwt";

type Role = "admin" | "cashier";

interface AuthContextValue {
  accessToken: string | null;
  userId: string | null;
  tenantId: string | null;
  role: Role | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function applyToken(token: string | null) {
    setAccessToken(token);
    setStoredAccessToken(token);
  }

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.accessToken) {
          applyToken(data.accessToken);
        }
      })
      .catch((error) => {
        console.error("Error refreshing access token:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      applyToken(data.accessToken);
    } else if (response.status === 401) {
      throw new Error("invalid_credentials");
    } else if (response.status === 400) {
      throw new Error("missing_credentials");
    } else {
      throw new Error("login_failed");
    }
  }

  async function logout() {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    applyToken(null);
  }

  const decoded = accessToken ? decodeAccessToken(accessToken) : null;

  const value: AuthContextValue = {
    accessToken,
    userId: decoded?.sub ?? null,
    tenantId: decoded?.tenantId ?? null,
    role: decoded?.role ?? null,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
