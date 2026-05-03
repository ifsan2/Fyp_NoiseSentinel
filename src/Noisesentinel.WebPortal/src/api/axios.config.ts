import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG } from "@/utils/constants";
import storageService from "@/utils/storage";

const resolveRequestUrl = (
  baseURL: string | undefined,
  url: string | undefined,
) => {
  if (!url) {
    return baseURL || "unknown";
  }

  if (!baseURL) {
    return url;
  }

  return `${baseURL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storageService.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const resolvedUrl = resolveRequestUrl(
      config.baseURL || API_CONFIG.BASE_URL,
      config.url,
    );

    console.log("📤 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL || API_CONFIG.BASE_URL,
      resolvedUrl,
      hasAuth: !!token,
    });

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      url: response.config.url,
    });

    return response;
  },
  async (error: AxiosError<any>) => {
    const resolvedUrl = resolveRequestUrl(
      error.config?.baseURL || API_CONFIG.BASE_URL,
      error.config?.url,
    );

    console.error("❌ API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL || API_CONFIG.BASE_URL,
      resolvedUrl,
      message: error.response?.data?.message || error.message,
      code: error.code,
    });

    // Handle network errors specifically
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      console.error(
        "🔌 Network Error: Check if the backend server is running and accessible",
      );
      console.error(
        "🔧 Backend URL:",
        error.config?.baseURL || API_CONFIG.BASE_URL,
      );
      console.error("🔗 Resolved URL:", resolvedUrl);
    }

    // Handle SSL errors
    if (
      error.code === "ERR_SSL_PROTOCOL_ERROR" ||
      error.message.includes("SSL")
    ) {
      console.error(
        "🔒 SSL Error: Backend might be running on HTTP instead of HTTPS",
      );
      console.error("💡 Try changing HTTPS to HTTP in your .env file");
    }

    // Handle specific error codes
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Token expired or invalid
          storageService.clearAll();
          window.location.href = "/login";
          break;

        case 403:
          // Forbidden
          console.error("Access Denied");
          break;

        case 404:
          // Not Found
          console.error("Resource not found");
          break;

        case 500:
          // Server Error
          console.error("Server error");
          break;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
