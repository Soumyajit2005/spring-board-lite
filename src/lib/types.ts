// Task related types
export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  // AI Enhancement fields (optional - won't break existing functionality)
  aiData?: {
    category?: string;
    estimatedHours?: number;
    enhancedDescription?: string;
    confidence?: number;
  };
  // Smart Scheduler fields
  scheduling?: {
    deadline?: string;
    estimatedDuration?: number; // in minutes
    energyLevel?: EnergyLevel;
    dependencies?: string[]; // task IDs this depends on
    scheduledFor?: string; // when AI schedules this task
    gitIntegration?: {
      repositoryUrl?: string;
      branch?: string;
      commitPattern?: string; // regex pattern to match commits
      autoComplete?: boolean;
    };
    developerContext?: {
      taskType?: DeveloperTaskType;
      techStack?: string[];
      complexity?: ComplexityLevel;
      focusTime?: boolean; // requires deep focus
    };
  };
}

export type EnergyLevel = "low" | "medium" | "high";
export type DeveloperTaskType =
  | "coding"
  | "debugging"
  | "research"
  | "documentation"
  | "testing"
  | "review"
  | "meeting"
  | "planning";
export type ComplexityLevel = "simple" | "moderate" | "complex";

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface CreateTaskInput {
  title: string;
  description: string;
  priority: TaskPriority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  scheduling?: Partial<Task["scheduling"]>;
}

// Smart Scheduler types
export interface ScheduleSlot {
  id: string;
  startTime: string;
  endTime: string;
  taskId: string;
  energyRequired: EnergyLevel;
  isFlexible: boolean;
}

export interface DeveloperProfile {
  userId: string;
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
  energyPattern: {
    morning: EnergyLevel;
    afternoon: EnergyLevel;
    evening: EnergyLevel;
  };
  preferredTaskTypes: DeveloperTaskType[];
  techStack: string[];
  focusBlocks: {
    duration: number; // minutes
    breakBetween: number; // minutes
  };
  gitRepositories: string[];
}

// Optimistic update types
export interface OptimisticUpdate<T = Task> {
  id: string;
  type: "create" | "update" | "delete";
  previousState: T | null;
  newState: T | null;
  timestamp: number;
  rollbackFn?: () => void;
}

export interface UndoableAction {
  taskId: string;
  previousState: Task;
  newState: Task;
  timestamp: number;
  expiresAt: number;
}

// API types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Auth types
export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// UI State types
export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info" | "undo";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface DragState {
  isDragging: boolean;
  draggedTask: Task | null;
  dropTarget: TaskStatus | null;
}

export interface FilterState {
  searchQuery: string;
  priorityFilter: TaskPriority | "all";
  statusFilter: TaskStatus | "all";
}

// Board types
export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color?: string;
  icon?: React.ReactNode;
}

export interface BoardState {
  tasks: Task[];
  columns: Column[];
  loading: boolean;
  error: ApiError | null;
  optimisticUpdates: OptimisticUpdate[];
}

// Offline queue types (for variant Q-Z)
export interface QueuedAction {
  id: string;
  type: "create" | "update" | "delete";
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineState {
  isOnline: boolean;
  queue: QueuedAction[];
  syncing: boolean;
  lastSyncTime: number | null;
}

// Theme types
export type Theme = "light" | "dark" | "system";

export interface ThemeState {
  current: Theme;
  resolved: "light" | "dark";
}

// Performance metrics
export interface PerformanceMetrics {
  dragStartTime?: number;
  dragEndTime?: number;
  apiCallStartTime?: number;
  apiCallEndTime?: number;
  renderStartTime?: number;
  renderEndTime?: number;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Hook return types
export interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: ApiError | null;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, status: TaskStatus) => Promise<void>;
  undoLastAction: () => void;
  canUndo: boolean;
  optimisticUpdates: OptimisticUpdate[];
}

export interface UseAuthReturn {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export interface UseOptimisticReturn<T> {
  data: T;
  setOptimistic: (newData: T) => void;
  rollback: () => void;
  commit: () => void;
  isPending: boolean;
}

// Configuration types
export interface AppConfig {
  apiUrl: string;
  apiTimeout: number;
  failureRate: number;
  variant: "a-g" | "h-p" | "q-z";
  features: {
    enableOfflineMode: boolean;
    enableKeyboardShortcuts: boolean;
    enableUndoRedo: boolean;
    enableDarkMode: boolean;
    enableAIFeatures: boolean;
  };
}

// AI Feature Types
export interface AIInsight {
  id: string;
  type:
    | "categorization"
    | "time_estimation"
    | "suggestion"
    | "productivity"
    | "completion_probability";
  message: string;
  confidence: number;
  data?: any;
  actions?: string[];
  timestamp: number;
}

export interface AITaskEnhancement {
  taskId: string;
  category?: string;
  estimatedHours?: number;
  enhancedDescription?: string;
  confidence: number;
  timestamp: number;
}

export interface ProductivityMetrics {
  completedTasks: number;
  averageCompletionTime: number;
  burnoutRisk: "low" | "medium" | "high";
  productivityScore: number;
  weeklyReport: {
    tasksCompleted: number;
    averageTaskTime: number;
    peakProductivityHours: string[];
    recommendations: string[];
  };
}
