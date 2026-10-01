import axios from "axios";
import { mockHandlers } from "./mockService";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s timeout for AI generation / Cloudinary processing
});

let isSimulationActive = false;

function markSimulationMode(active = true) {
  if (isSimulationActive !== active) {
    isSimulationActive = active;
    if (typeof window !== "undefined") {
      window.__PF_SIMULATION_ACTIVE = active;
      window.dispatchEvent(
        new CustomEvent("pf-simulation-mode", { detail: { active } })
      );
    }
  }
}

export function getIsSimulationActive() {
  return isSimulationActive;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pf_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// Helper to execute with smart mock fallback
async function withFallback(apiFn, mockFn) {
  try {
    const res = await apiFn();
    markSimulationMode(false);
    return res;
  } catch (error) {
    console.warn("[API withFallback] Backend request caught error:", {
      status: error.response?.status,
      code: error.code,
      message: error.message,
    });

    // For explicit 401 on real server
    if (error.response?.status === 401) {
      localStorage.removeItem("pf_token");
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pf-auth-expired", {
            detail: error?.response?.data?.message || "Session expired",
          })
        );
      }
      throw error;
    }

    // Pass through client/validation errors from the actual server (400, 402, 403, etc.)
    if (error.response && error.response.status < 500 && error.response.status !== 404) {
      throw error;
    }

    // Only fallback to mock if server is completely unreachable / offline (network error or 5xx/404)
    const isNetworkError =
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      error.message?.includes("Network Error") ||
      error.message?.includes("timeout") ||
      error.response?.status >= 500 ||
      error.response?.status === 404;

    if (isNetworkError) {
      console.log("🚨 [API withFallback] SERVER UNREACHABLE OR ERROR — TRIGGERING MOCK FALLBACK 🚨");
      markSimulationMode(true);
      const mockData = await mockFn();
      return { data: mockData, status: 200, isMock: true };
    }

    throw error;
  }
}

export const authApi = {
  register: (payload) =>
    withFallback(
      () => api.post("/auth/register", payload),
      () => mockHandlers.authRegister(payload)
    ),
  login: (payload) =>
    withFallback(
      () => api.post("/auth/login", payload),
      () => mockHandlers.authLogin(payload)
    ),
  me: () =>
    withFallback(
      () => api.get("/auth/me"),
      () => mockHandlers.authMe()
    ),
  updateProfile: (payload) =>
    withFallback(
      () => api.put("/auth/me", payload),
      () => mockHandlers.updateProfile(payload)
    ),
};

export const generateApi = {
  enhance: (payload) =>
    withFallback(
      () => api.post("/generate/enhance", payload),
      () => mockHandlers.generateEnhance(payload)
    ),
  textToImage: (payload) =>
    withFallback(
      () => api.post("/generate/text-to-image", payload, { timeout: 90000 }),
      () => mockHandlers.textToImage(payload)
    ),
  imageToImage: (formData) =>
    withFallback(
      () =>
        api.post("/generate/image-to-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 90000,
        }),
      () => mockHandlers.imageToImage(formData)
    ),
  variations: (payload) =>
    withFallback(
      () => api.post("/generate/variations", payload, { timeout: 90000 }),
      () => mockHandlers.variations(payload)
    ),
  upscale: (payload) =>
    withFallback(
      () => api.post("/generate/upscale", payload, { timeout: 90000 }),
      () => mockHandlers.upscale(payload)
    ),
  removeBg: (payload) =>
    withFallback(
      () => api.post("/generate/remove-bg", payload, { timeout: 90000 }),
      () => mockHandlers.removeBg(payload)
    ),
};

export const imagesApi = {
  community: (params) =>
    withFallback(
      () => api.get("/images/community", { params }),
      () => mockHandlers.community(params)
    ),
  library: (params) =>
    withFallback(
      () => api.get("/images/library", { params }),
      () => mockHandlers.library(params)
    ),
  dashboard: () =>
    withFallback(
      () => api.get("/images/dashboard"),
      () => mockHandlers.dashboard()
    ),
  delete: (ids) =>
    withFallback(
      () => api.post("/images/delete", { ids }),
      () => ({ success: true, count: ids?.length || 0 })
    ),
  move: (ids, folder) =>
    withFallback(
      () => api.post("/images/move", { ids, folder }),
      () => ({ success: true })
    ),
  createFolder: (payload) =>
    withFallback(
      () => api.post("/images/folders", payload),
      () => ({ folder: { id: Date.now().toString(), ...payload } })
    ),
  update: (id, payload) =>
    withFallback(
      () => api.patch(`/images/${id}`, payload),
      () => ({ success: true })
    ),
};

export const billingApi = {
  plans: () =>
    withFallback(
      () => api.get("/payments/plans"),
      () => mockHandlers.paymentsPlans()
    ),
  paymentConfig: () =>
    withFallback(
      () => api.get("/payments/config"),
      () => ({ upiId: "" })
    ),
  createOrder: (planId) =>
    withFallback(
      () => api.post("/payments/order", { planId }),
      () => mockHandlers.paymentsOrder(planId)
    ),
  createUpiOrder: (planId) =>
    withFallback(
      () => api.post("/payments/upi-order", { planId }),
      () => mockHandlers.paymentsUpiOrder(planId)
    ),
  verify: (payload) =>
    withFallback(
      () => api.post("/payments/verify", payload),
      () => mockHandlers.paymentsVerify(payload)
    ),
  paymentFailed: (payload) =>
    withFallback(
      () => api.post("/payments/payment-failed", payload),
      () => ({ success: true })
    ),
};

export const socialApi = {
  search: (q) =>
    withFallback(
      () => api.get("/social/search", { params: { q } }),
      () => ({ users: [] })
    ),
  profile: (username) =>
    withFallback(
      () => api.get(`/social/profile/${username}`),
      () => ({
        user: {
          name: username,
          username,
          bio: "AI Generative Creator",
          creationsCount: 12,
        },
      })
    ),
  feed: () =>
    withFallback(
      () => api.get("/social/feed"),
      () => mockHandlers.socialFeed()
    ),
  friends: () =>
    withFallback(
      () => api.get("/social/friends"),
      () => mockHandlers.socialFriends()
    ),
  requests: () =>
    withFallback(
      () => api.get("/social/friends/requests"),
      () => ({ requests: [] })
    ),
  sendRequest: (username) =>
    withFallback(
      () => api.post("/social/friends/request", { username }),
      () => ({ success: true })
    ),
  respondRequest: (requestId, accept) =>
    withFallback(
      () => api.post("/social/friends/respond", { requestId, accept }),
      () => ({ success: true })
    ),
  conversations: () =>
    withFallback(
      () => api.get("/social/conversations"),
      () => ({ conversations: [] })
    ),
  messages: (friendId) =>
    withFallback(
      () => api.get(`/social/chat/${friendId}`),
      () => mockHandlers.socialChat(friendId)
    ),
  sendMessage: (friendId, text) =>
    withFallback(
      () => api.post(`/social/chat/${friendId}`, { text }),
      () => mockHandlers.socialSendMessage(friendId, text)
    ),
};

export default api;
