import axios from "axios";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface Transaction {
  id: number;
  purpose: string;
  category: string;
  sum: number;
  currency: string;
  date: string;
  type: "income" | "expense";
  userId: string;
}

interface Category {
  id: number;
  name: string;
  type: "Income" | "Expense";
  userId?: string;
}

interface CustomJwtPayload {
  exp: number;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  iss: string;
  aud: string;
}

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
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/Account/refresh-token`, 
          { refreshToken },
          { withCredentials: true }
        );

        const { token, refreshToken: newRefreshToken } = response.data;

        // Update the tokens in cookies
        Cookies.set('token', token, { secure: true, sameSite: 'strict' });
        if (newRefreshToken) {
          Cookies.set('refreshToken', newRefreshToken, { secure: true, sameSite: 'strict' });
        }

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, clear cookies and redirect to login
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        Cookies.remove('user');
        window.location.href = 'http://localhost:3000/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/Account/login', credentials);
    if (response.data.token) {
      Cookies.set('token', response.data.token, { secure: true, sameSite: 'strict' });
      if (response.data.refreshToken) {
        Cookies.set('refreshToken', response.data.refreshToken, { secure: true, sameSite: 'strict' });
      }
      // Store user info in cookies
      const decodedToken = jwtDecode<CustomJwtPayload>(response.data.token);
      Cookies.set('user', JSON.stringify({
        id: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        name: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        email: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
        role: decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      }), { secure: true, sameSite: 'strict' });
    }
    return response;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const response = await api.post('/Account/register', userData);
    return response;
  },

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
  },

  refreshToken: async () => {
    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return api.post('/Account/refresh-token', { refreshToken });
  }
} as const;

export const transactionApi = {
  async getTransactions() {
    const token = Cookies.get('token');
    const userCookie = Cookies.get('user');
    if (!token || !userCookie) {
      throw new Error("Not authenticated");
    }

    const user = JSON.parse(userCookie);
    const response = await api.get('/Transaction');
    const data = response.data;
    
    // Filter transactions for the current user
    return data.filter((t: any) => t.userId === user.id);
  },

  async addTransaction(transaction: any) {
    const token = Cookies.get('token');
    const userCookie = Cookies.get('user');
    if (!token || !userCookie) {
      throw new Error("Not authenticated");
    }

    const user = JSON.parse(userCookie);
    const response = await api.post('/Transaction', {
      ...transaction,
      userId: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    return response.data;
  },

  async updateTransaction(id: number, transaction: any) {
    const token = Cookies.get('token');
    const userCookie = Cookies.get('user');
    if (!token || !userCookie) {
      throw new Error("Not authenticated");
    }

    const user = JSON.parse(userCookie);
    const response = await api.put(`/Transaction/${id}`, {
      ...transaction,
      userId: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    return response.data;
  },

  async deleteTransaction(id: number) {
    const token = Cookies.get('token');
    if (!token) {
      throw new Error("Not authenticated");
    }

    await api.delete(`/Transaction/${id}`);
  }
};

export const transactionService = {
  addIncome: async (data: { source: string; sum: number; date: string }) => {
    try {
      const userCookie = Cookies.get('user');
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const requestData = {
        ...data,
        userId: user.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };

      return api.post('/Income', requestData);
    } catch (error) {
      console.error("Error in addIncome:", error);
      throw error;
    }
  },

  addExpense: async (data: {
    vendor: string;
    categoryId: string;
    amount: string;
    date: string;
    description?: string;
  }) => {
    try {
      const userCookie = Cookies.get('user');
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const formattedDate = new Date(data.date).toISOString().split('T')[0];

      const requestData = {
        vendor: data.vendor.trim(),
        categoryId: parseInt(data.categoryId),
        amount: parseFloat(data.amount),
        date: formattedDate,
        description: data.description?.trim() || null,
        userId: user.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };

      return api.post('/Expense', requestData);
    } catch (error) {
      console.error("Error in addExpense:", error);
      throw error;
    }
  },

  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const userCookie = Cookies.get('user');
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const [incomesResponse, expensesResponse] = await Promise.all([
        api.get('/Income'),
        api.get('/Expense'),
      ]);

      const incomes = incomesResponse.data
        .filter((income: any) => income.userId === user.id)
        .map((income: any) => ({
          id: `income_${income.id}`,
          purpose: income.source,
          category: income.category?.name || "Uncategorized",
          sum: income.amount,
          currency: "EUR",
          date: income.date,
          type: "income" as const,
          userId: user.id
        }));

      const expenses = expensesResponse.data
        .filter((expense: any) => expense.userId === user.id)
        .map((expense: any) => ({
          id: `expense_${expense.id}`,
          purpose: expense.vendor,
          category: expense.category?.name || "Uncategorized",
          sum: expense.amount,
          currency: "EUR",
          date: expense.date,
          type: "expense" as const,
          userId: user.id
        }));

      return [...incomes, ...expenses].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  getIncome: async () => {
    try {
      const userCookie = Cookies.get('user');
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await api.get('/Income');
      return response.data.filter((income: any) => income.userId === user.id);
    } catch (error) {
      console.error("Error fetching income:", error);
      throw error;
    }
  },

  getExpenses: async () => {
    try {
      const userCookie = Cookies.get('user');
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await api.get('/Expense');
      return response.data.filter((expense: any) => expense.userId === user.id);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },

  getExpense: async (id: number) => {
    try {
      const userCookie = Cookies.get('user');
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await api.get(`/Expense/${id}`);
      const expense = response.data;
      
      // Verify the expense belongs to the current user
      if (expense.userId !== user.id) {
        throw new Error("Unauthorized access to expense");
      }
      
      return expense;
    } catch (error) {
      console.error("Error fetching expense:", error);
      throw error;
    }
  },

  updateExpense: async (id: number, data: {
    vendor: string;
    categoryId: string;
    amount: string;
    date: string;
    description?: string;
  }) => {
    try {
      const token = Cookies.get('token');
      const userCookie = Cookies.get('user');
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (!user?.id || !token) {
        throw new Error("User not authenticated");
      }

      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const categoryId = parseInt(data.categoryId);
      if (isNaN(categoryId)) {
        throw new Error("Invalid category ID");
      }

      const requestData = {
        vendor: data.vendor.trim(),
        categoryId: categoryId,
        amount: amount,
        date: new Date(data.date).toISOString(),
        description: data.description?.trim(),
        userId: user.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };

      const response = await api.put(`/Expense/${id}`, requestData);
      return response.data;
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },

  deleteExpense: async (id: number) => {
    try {
      const userCookie = Cookies.get('user');
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // First verify the expense belongs to the current user
      const expense = await api.get(`/Expense/${id}`);
      if (expense.data.userId !== user.id) {
        throw new Error("Unauthorized access to expense");
      }

      const response = await api.delete(`/Expense/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const userCookie = Cookies.get('user');
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await api.get('/Category');
      return response.data.filter((category: Category) => 
        category.type === "Expense" && (!category.userId || category.userId === user.id)
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },
};

export default api;
