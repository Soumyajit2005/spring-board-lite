import {
  Task,
  TaskPriority,
  TaskStatus,
  ValidationResult,
  ValidationError,
} from "./types";

// Class name utility (similar to clsx)
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

// Format date for display
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const hours = d.getHours();
    const minutes = d.getMinutes();
    return `Today at ${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "just now";
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  } else if (diffDay < 30) {
    return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  } else {
    return formatDate(date);
  }
}

// Priority colors and labels
export const priorityConfig = {
  low: {
    label: "Low",
    color: "gray",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    borderClassName: "border-gray-300 dark:border-gray-600",
  },
  medium: {
    label: "Medium",
    color: "yellow",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    borderClassName: "border-yellow-300 dark:border-yellow-700",
  },
  high: {
    label: "High",
    color: "red",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    borderClassName: "border-red-300 dark:border-red-700",
  },
};

// Status colors and labels
export const statusConfig = {
  todo: {
    label: "Todo",
    color: "gray",
    icon: "📝",
    className: "bg-gray-100 dark:bg-gray-800",
  },
  "in-progress": {
    label: "In Progress",
    color: "blue",
    icon: "🚀",
    className: "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20",
  },
  done: {
    label: "Done",
    color: "green",
    icon: "✅",
    className: "bg-green-50 dark:bg-green-900 dark:bg-opacity-20",
  },
};

// Sort tasks
export function sortTasks(
  tasks: Task[],
  sortBy: "priority" | "createdAt" | "updatedAt" | "title" = "createdAt",
  order: "asc" | "desc" = "desc"
): Task[] {
  const sorted = [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "createdAt":
      case "updatedAt":
        comparison =
          new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime();
        break;
    }

    return order === "asc" ? comparison : -comparison;
  });

  return sorted;
}

// Filter tasks
export function filterTasks(
  tasks: Task[],
  filters: {
    searchQuery?: string;
    priority?: TaskPriority | "all";
    status?: TaskStatus | "all";
  }
): Task[] {
  return tasks.filter((task) => {
    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDescription = task.description.toLowerCase().includes(query);

      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }

    // Priority filter
    if (filters.priority && filters.priority !== "all") {
      if (task.priority !== filters.priority) {
        return false;
      }
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      if (task.status !== filters.status) {
        return false;
      }
    }

    return true;
  });
}

// Group tasks by status
export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  return tasks.reduce((groups, task) => {
    const status = task.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(task);
    return groups;
  }, {} as Record<TaskStatus, Task[]>);
}

// Validate task input
export function validateTaskInput(input: {
  title?: string;
  description?: string;
  priority?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Title validation
  if (!input.title || input.title.trim().length === 0) {
    errors.push({
      field: "title",
      message: "Title is required",
    });
  } else if (input.title.length > 100) {
    errors.push({
      field: "title",
      message: "Title must be less than 100 characters",
    });
  }

  // Description validation
  if (input.description && input.description.length > 500) {
    errors.push({
      field: "description",
      message: "Description must be less than 500 characters",
    });
  }

  // Priority validation
  if (input.priority && !["low", "medium", "high"].includes(input.priority)) {
    errors.push({
      field: "priority",
      message: "Invalid priority value",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

// Check if arrays are equal
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

// Calculate task statistics
export function calculateTaskStats(tasks: Task[]) {
  const total = tasks.length;
  const byStatus = groupTasksByStatus(tasks);
  const byPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<TaskPriority, number>);

  return {
    total,
    todo: byStatus.todo?.length || 0,
    inProgress: byStatus["in-progress"]?.length || 0,
    done: byStatus.done?.length || 0,
    highPriority: byPriority.high || 0,
    mediumPriority: byPriority.medium || 0,
    lowPriority: byPriority.low || 0,
    completionRate:
      total > 0
        ? (((byStatus.done?.length || 0) / total) * 100).toFixed(1)
        : "0",
  };
}

// Export all utilities
export default {
  cn,
  formatDate,
  formatRelativeTime,
  priorityConfig,
  statusConfig,
  sortTasks,
  filterTasks,
  groupTasksByStatus,
  validateTaskInput,
  generateId,
  debounce,
  throttle,
  deepClone,
  arraysEqual,
  calculateTaskStats,
};
