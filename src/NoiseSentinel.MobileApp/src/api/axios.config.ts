import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import Toast from "react-native-toast-message";
import storageService from "../services/storage.service";
import { API_CONFIG } from "../utils/constants";

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
  async (config: InternalAxiosRequestConfig) => {
    const token = await storageService.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging
    console.log("📤 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
      hasAuth: !!token,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log("✅ API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });

    return response;
  },
  async (error: AxiosError<any>) => {
    // Log error with full details
    console.error("❌ API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      fullURL: `${error.config?.baseURL || ""}${error.config?.url || ""}`,
      message: error.response?.data?.message || error.message,
      errorData: error.response?.data,
      networkError: !error.response,
    });

    // Handle specific error codes
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Token expired or invalid
          Toast.show({
            type: "error",
            text1: "Session Expired",
            text2: "Please login again",
          });

          // Clear storage and redirect to login
          await storageService.clearAll();
          // Navigation will be handled by AuthContext
          break;

        case 403:
          // Forbidden
          Toast.show({
            type: "error",
            text1: "Access Denied",
            text2: data?.message || "You do not have permission",
          });
          break;

        case 404:
          // Not Found
          Toast.show({
            type: "error",
            text1: "Not Found",
            text2: data?.message || "Resource not found",
          });
          break;

        case 400:
          // Bad Request - Validation errors
          if (data?.errors) {
            const errorMessages = Object.values(data.errors).flat();
            Toast.show({
              type: "error",
              text1: "Validation Error",
              text2: errorMessages[0] as string,
            });
          } else {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: data?.message || "Invalid request",
            });
          }
          break;

        case 500:
          // Server Error
          Toast.show({
            type: "error",
            text1: "Server Error",
            text2: "Something went wrong. Please try again later.",
          });
          break;

        default:
          Toast.show({
            type: "error",
            text1: "Error",
            text2: data?.message || "An error occurred",
          });
      }
    } else if (error.request) {
      // Network error
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Please check your internet connection",
      });
    } else {
      // Other errors
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
