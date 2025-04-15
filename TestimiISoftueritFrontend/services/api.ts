import axios from "axios";

const API_BASE_URL = "https://localhost:7176/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a request interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await api.post('/Account/refresh-token');
        const { token } = response.data;

        // Update the token in the original request
        originalRequest.headers['Authorization'] = `Bearer ${token}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    return api.post("/Account/register", userData);
  },

  login: async (loginData: { email: string; password: string }) => {
    return api.post("/Account/login", loginData);
  },

  refreshToken: async () => {
    return api.post("/Account/refresh-token");
  }
};

export const transactionService = {
  addIncome: async (transactionData: {
    source: string;
    sum: number;
    date: string;
  }) => {
    // Mock successful response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          data: { 
            message: "Income recorded successfully",
            transactionId: Math.floor(Math.random() * 1000)
          } 
        });
      }, 1000);
    });
    
    // In production, use:
    // return api.post("/Transactions/income", transactionData);
  },
  // Add other transaction methods as needed
};

export default api;
