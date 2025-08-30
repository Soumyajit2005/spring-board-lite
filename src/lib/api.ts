import axios, { AxiosError, AxiosInstance } from "axios";
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  ApiResponse,
  ApiError,
  LoginCredentials,
  RegisterCredentials,
  User,
  AuthResponse,
} from "./types";

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const FAILURE_RATE = parseFloat(process.env.NEXT_PUBLIC_FAILURE_RATE || "0.1");
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "10000");

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const apiError: ApiError = {
      message:
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred",
      code: error.code,
      details: error.response?.data,
    };
    return Promise.reject(apiError);
  }
);

// Simulate random failures in development
const simulateFailure = (): boolean => {
  if (process.env.NODE_ENV === "development") {
    return Math.random() < FAILURE_RATE;
  }
  return false;
};

// Delay function for simulating network latency
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Task API methods
export const taskApi = {
  // Get all tasks
  async getAllTasks(): Promise<ApiResponse<Task[]>> {
    try {
      await delay(300); // Simulate network delay

      if (simulateFailure()) {
        throw new Error("Simulated API failure");
      }

      // Get current user ID
      const userStr =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const userId = userStr ? JSON.parse(userStr).id : "1";

      const response = await apiClient.get<Task[]>(`/tasks?userId=${userId}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error as ApiError,
        success: false,
      };
    }
  },

  // Get single task
  async getTask(id: string): Promise<ApiResponse<Task>> {
    try {
      await delay(200);
      const response = await apiClient.get<Task>(`/tasks/${id}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error as ApiError,
        success: false,
      };
    }
  },

  // Create task
  async createTask(input: CreateTaskInput): Promise<ApiResponse<Task>> {
    try {
      await delay(300);

      if (simulateFailure()) {
        throw new Error("Failed to create task - simulated failure");
      }

      // Get current user ID
      const userStr =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const userId = userStr ? JSON.parse(userStr).id : "1";

      const newTask: Omit<Task, "id"> = {
        ...input,
        userId,
        status: "todo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await apiClient.post<Task>("/tasks", newTask);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error as ApiError,
        success: false,
      };
    }
  },

  // Update task
  async updateTask(
    id: string,
    input: UpdateTaskInput
  ): Promise<ApiResponse<Task>> {
    try {
      await delay(300);

      if (simulateFailure()) {
        throw new Error("Failed to update task - simulated failure");
      }

      const updates = {
        ...input,
        updatedAt: new Date().toISOString(),
      };

      const response = await apiClient.patch<Task>(`/tasks/${id}`, updates);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error as ApiError,
        success: false,
      };
    }
  },

  // Delete task
  async deleteTask(id: string): Promise<ApiResponse<void>> {
    try {
      await delay(300);

      if (simulateFailure()) {
        throw new Error("Failed to delete task - simulated failure");
      }

      await apiClient.delete(`/tasks/${id}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error as ApiError,
        success: false,
      };
    }
  },

  // Move task (convenience method)
  async moveTask(
    id: string,
    newStatus: Task["status"]
  ): Promise<ApiResponse<Task>> {
    return taskApi.updateTask(id, { status: newStatus });
  },

  // Batch update tasks
  async batchUpdateTasks(
    updates: Array<{ id: string; changes: UpdateTaskInput }>
  ): Promise<ApiResponse<Task[]>> {
    try {
      const promises = updates.map(({ id, changes }) =>
        taskApi.updateTask(id, changes)
      );

      const results = await Promise.all(promises);
      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      if (failed.length > 0) {
        return {
          error: {
            message: `Failed to update ${failed.length} tasks`,
            details: { failed },
          },
          success: false,
        };
      }

      return {
        data: successful.map((r) => r.data!),
        success: true,
      };
    } catch (error: any) {
      return {
        error: error as ApiError,
        success: false,
      };
    }
  },
};

// Auth API methods (mock implementation)
export const authApi = {
  // Register
  async register(
    credentials: RegisterCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      await delay(800);

      // Basic validation
      if (
        !credentials.fullName ||
        !credentials.email ||
        !credentials.password
      ) {
        const error: ApiError = {
          message: "All fields are required",
        };
        throw error;
      }

      if (credentials.password !== credentials.confirmPassword) {
        const error: ApiError = {
          message: "Passwords do not match",
        };
        throw error;
      }

      if (credentials.password.length < 6) {
        const error: ApiError = {
          message: "Password must be at least 6 characters long",
        };
        throw error;
      }

      // Check if user already exists (mock check)
      const existingUsers = await this.checkUserExists(credentials.email);
      if (existingUsers.success && existingUsers.data) {
        const error: ApiError = {
          message: "User with this email already exists",
        };
        throw error;
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: credentials.email,
        fullName: credentials.fullName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockToken = `mock-jwt-${Date.now()}`;

      // Save to mock database (in real app, this would be server-side)
      const response = await apiClient.post<User>("/users", newUser);

      // Store token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", mockToken);
        localStorage.setItem("user", JSON.stringify(response.data));
      }

      return {
        data: {
          user: response.data,
          token: mockToken,
        },
        success: true,
      };
    } catch (error: any) {
      return {
        error: error as ApiError,
        success: false,
      };
    }
  },

  // Check if user exists
  async checkUserExists(email: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiClient.get<User[]>(`/users?email=${email}`);
      return {
        data: response.data.length > 0,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error as ApiError,
        success: false,
      };
    }
  },

  // Login
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      await delay(500);

      // Mock authentication - check against registered users
      if (!credentials.email || !credentials.password) {
        const error: ApiError = {
          message: "Email and password are required",
        };
        throw error;
      }

      // Get user from mock database
      const response = await apiClient.get<User[]>(
        `/users?email=${credentials.email}`
      );
      const users = response.data;

      if (users.length === 0) {
        const error: ApiError = {
          message: "Invalid email or password",
        };
        throw error;
      }

      // In a real app, you'd verify the password hash
      const user = users[0];
      const mockToken = `mock-jwt-${Date.now()}`;

      // Store token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", mockToken);
        localStorage.setItem("user", JSON.stringify(user));
      }

      return {
        data: {
          user,
          token: mockToken,
        },
        success: true,
      };
    } catch (error: any) {
      return {
        error: error as ApiError,
        success: false,
      };
    }
  },

  // Logout
  async logout(): Promise<ApiResponse<void>> {
    try {
      await delay(200);

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error as ApiError,
        success: false,
      };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      await delay(200);

      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");

        if (!token || !userStr) {
          const error: ApiError = {
            message: "Not authenticated",
          };
          throw error;
        }

        const user = JSON.parse(userStr);
        return {
          data: user,
          success: true,
        };
      }

      const error: ApiError = {
        message: "Not in browser environment",
      };
      throw error;
    } catch (error: any) {
      return {
        error: error as ApiError,
        success: false,
      };
    }
  },

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      await delay(300);

      const currentToken =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;

      if (!currentToken) {
        const error: ApiError = {
          message: "No token to refresh",
        };
        throw error;
      }

      const newToken = `mock-jwt-refreshed-${Date.now()}`;

      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", newToken);
      }

      return {
        data: { token: newToken },
        success: true,
      };
    } catch (error: any) {
      return {
        error: error as ApiError,
        success: false,
      };
    }
  },
};

// Utility functions
export const utils = {
  // Retry failed request
  async retryRequest<T>(
    fn: () => Promise<ApiResponse<T>>,
    maxRetries = 3,
    retryDelay = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: ApiError | undefined;

    for (let i = 0; i < maxRetries; i++) {
      const result = await fn();

      if (result.success) {
        return result;
      }

      lastError = result.error;

      if (i < maxRetries - 1) {
        await delay(retryDelay * Math.pow(2, i)); // Exponential backoff
      }
    }

    return {
      error: lastError || { message: "Max retries exceeded" },
      success: false,
    };
  },

  // Check if online
  isOnline(): boolean {
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  },

  // Queue action for offline processing
  queueOfflineAction(action: any): void {
    if (typeof window === "undefined") return;

    const queue = JSON.parse(localStorage.getItem("offlineQueue") || "[]");
    queue.push({
      ...action,
      timestamp: Date.now(),
    });
    localStorage.setItem("offlineQueue", JSON.stringify(queue));
  },

  // Process offline queue
  async processOfflineQueue(): Promise<void> {
    if (typeof window === "undefined") return;

    const queue = JSON.parse(localStorage.getItem("offlineQueue") || "[]");

    for (const action of queue) {
      // Process each queued action
      // Implementation depends on action type
      console.log("Processing offline action:", action);
    }

    localStorage.setItem("offlineQueue", "[]");
  },
};

export default {
  task: taskApi,
  auth: authApi,
  utils,
};
