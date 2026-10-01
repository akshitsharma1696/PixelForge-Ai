import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import { authApi, getIsSimulationActive } from "../api/client";
import { getDemoCredits, setDemoCredits, getDemoUser, saveDemoUser } from "../api/mockService";

const AppContext = createContext(null);

const TOKEN_KEY = "pf_token";

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [credits, setCreditsState] = useState(() => getDemoCredits());
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [authLoading, setAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [remixPrompt, setRemixPrompt] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(() => getIsSimulationActive());

  const setCredits = useCallback((newVal) => {
    const val = typeof newVal === "function" ? newVal(credits) : newVal;
    setCreditsState(val);
    setDemoCredits(val);
  }, [credits]);

  const applyAuth = useCallback((nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
    }
    const finalUser = nextUser || getDemoUser();
    setUser(finalUser);
    saveDemoUser(finalUser);
    setCreditsState(finalUser?.credits ?? getDemoCredits());
  }, []);

  const logout = useCallback((message) => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    if (message) toast(message, { icon: "ℹ️" });
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setAuthLoading(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      if (data?.user) {
        setUser(data.user);
        setCreditsState(data.user.credits ?? getDemoCredits());
        setToken(storedToken);
      } else {
        const demo = getDemoUser();
        setUser(demo);
        setCreditsState(demo.credits);
      }
    } catch {
      // In simulation mode, do not logout! Restore demo user
      const demo = getDemoUser();
      setUser(demo);
      setCreditsState(demo.credits);
      setToken("demo-jwt-simulation-token");
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const onSimulationMode = (e) => {
      setIsDemoMode(e.detail?.active ?? true);
    };
    window.addEventListener("pf-simulation-mode", onSimulationMode);
    return () => window.removeEventListener("pf-simulation-mode", onSimulationMode);
  }, []);

  useEffect(() => {
    const onExpired = (event) => {
      logout(event.detail || "Session expired. Please sign in again.");
    };
    window.addEventListener("pf-auth-expired", onExpired);
    return () => window.removeEventListener("pf-auth-expired", onExpired);
  }, [logout]);

  const login = useCallback(
    async (email, password) => {
      try {
        const { data } = await authApi.login({ email, password });
        applyAuth(data.token, data.user);
        return data.user;
      } catch (err) {
        // Fallback demo user
        const demo = getDemoUser();
        demo.email = email || "admin@pixel.com";
        demo.name = email.split("@")[0] || "Alex Rivera";
        demo.username = demo.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        applyAuth("demo-jwt-simulation-token", demo);
        setIsDemoMode(true);
        return demo;
      }
    },
    [applyAuth]
  );

  const register = useCallback(
    async (name, email, password, username) => {
      try {
        const { data } = await authApi.register({
          name,
          email,
          password,
          username,
        });
        applyAuth(data.token, data.user);
        return data.user;
      } catch (err) {
        const demo = {
          _id: `demo-${Date.now()}`,
          name: name || "Alex Rivera",
          email: email || "admin@pixel.com",
          username: username || "alex_ai",
          credits: 99,
          bio: "AI Generative Creator",
          createdAt: new Date().toISOString(),
        };
        applyAuth("demo-jwt-simulation-token", demo);
        setIsDemoMode(true);
        return demo;
      }
    },
    [applyAuth]
  );

  const value = useMemo(
    () => ({
      user,
      setUser,
      credits,
      setCredits,
      token,
      authLoading,
      isAuthenticated: Boolean(user && token),
      isDemoMode,
      setIsDemoMode,
      login,
      register,
      logout,
      refreshUser,
      searchQuery,
      setSearchQuery,
      remixPrompt,
      setRemixPrompt,
    }),
    [
      user,
      credits,
      setCredits,
      token,
      authLoading,
      isDemoMode,
      searchQuery,
      remixPrompt,
      login,
      register,
      logout,
      refreshUser,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
