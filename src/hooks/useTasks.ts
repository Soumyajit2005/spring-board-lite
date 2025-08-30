import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import {
  Task,
  TaskStatus,
  CreateTaskInput,
  UpdateTaskInput,
  ApiError,
  UseTasksReturn,
  OptimisticUpdate,
  UndoableAction,
} from "@/lib/types";

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    OptimisticUpdate[]
  >([]);
  const [undoStack, setUndoStack] = useState<UndoableAction[]>([]);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Clean up undo timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);

    const result = await api.task.getAllTasks();

    if (result.success) {
      setTasks(result.data || []);
    } else {
      setError(result.error || null);
    }

    setLoading(false);
  };

  const createTask = async (input: CreateTaskInput) => {
    // Get current user ID (same logic as in API)
    const userStr =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const userId = userStr ? JSON.parse(userStr).id : "1";

    // Create optimistic task
    const tempTask: Task = {
      id: `temp-${Date.now()}`,
      userId,
      ...input,
      status: "todo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add optimistic update
    setTasks((prev) => [...prev, tempTask]);

    const optimisticUpdate: OptimisticUpdate = {
      id: tempTask.id,
      type: "create",
      previousState: null,
      newState: tempTask,
      timestamp: Date.now(),
    };

    setOptimisticUpdates((prev) => [...prev, optimisticUpdate]);

    // Make API call
    const result = await api.task.createTask(input);

    if (result.success && result.data) {
      // Update optimistic task with server response
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === tempTask.id ? result.data! : task))
      );

      // Remove optimistic update
      setOptimisticUpdates((prev) =>
        prev.filter((update) => update.id !== tempTask.id)
      );
    } else {
      // Rollback on failure
      setTasks((prev) => prev.filter((task) => task.id !== tempTask.id));
      setOptimisticUpdates((prev) =>
        prev.filter((update) => update.id !== tempTask.id)
      );

      throw new Error(result.error?.message || "Failed to create task");
    }
  };

  const updateTask = async (id: string, input: UpdateTaskInput) => {
    const originalTask = tasks.find((t) => t.id === id);
    if (!originalTask) {
      throw new Error("Task not found");
    }

    const updatedTask: Task = {
      ...originalTask,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? updatedTask : task))
    );

    const optimisticUpdate: OptimisticUpdate = {
      id,
      type: "update",
      previousState: originalTask,
      newState: updatedTask,
      timestamp: Date.now(),
    };

    setOptimisticUpdates((prev) => [...prev, optimisticUpdate]);

    // Make API call
    const result = await api.task.updateTask(id, input);

    if (result.success) {
      // Update successful, remove optimistic update
      setOptimisticUpdates((prev) => prev.filter((update) => update.id !== id));
    } else {
      // Rollback on failure
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? originalTask : task))
      );
      setOptimisticUpdates((prev) => prev.filter((update) => update.id !== id));

      throw new Error(result.error?.message || "Failed to update task");
    }
  };

  const deleteTask = async (id: string) => {
    const originalTask = tasks.find((t) => t.id === id);
    if (!originalTask) {
      throw new Error("Task not found");
    }

    // Optimistic update
    setTasks((prev) => prev.filter((task) => task.id !== id));

    const optimisticUpdate: OptimisticUpdate = {
      id,
      type: "delete",
      previousState: originalTask,
      newState: null,
      timestamp: Date.now(),
    };

    setOptimisticUpdates((prev) => [...prev, optimisticUpdate]);

    // Make API call
    const result = await api.task.deleteTask(id);

    if (result.success) {
      // Delete successful, remove optimistic update
      setOptimisticUpdates((prev) => prev.filter((update) => update.id !== id));
    } else {
      // Rollback on failure
      setTasks((prev) => [...prev, originalTask]);
      setOptimisticUpdates((prev) => prev.filter((update) => update.id !== id));

      throw new Error(result.error?.message || "Failed to delete task");
    }
  };

  const moveTask = async (id: string, status: TaskStatus) => {
    const originalTask = tasks.find((t) => t.id === id);
    if (!originalTask || originalTask.status === status) {
      return; // No change needed
    }

    const updatedTask: Task = {
      ...originalTask,
      status,
      updatedAt: new Date().toISOString(),
    };

    // Add to undo stack
    const undoAction: UndoableAction = {
      taskId: id,
      previousState: originalTask,
      newState: updatedTask,
      timestamp: Date.now(),
      expiresAt: Date.now() + 5000, // 5 second undo window
    };

    setUndoStack((prev) => [...prev, undoAction]);

    // Set timeout to remove from undo stack
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    undoTimeoutRef.current = setTimeout(() => {
      setUndoStack((prev) => prev.filter((action) => action.taskId !== id));
    }, 5000);

    // Perform the update
    await updateTask(id, { status });
  };

  const undoLastAction = useCallback(() => {
    const lastAction = undoStack[undoStack.length - 1];
    if (!lastAction) return;

    // Remove from undo stack
    setUndoStack((prev) => prev.slice(0, -1));

    // Clear timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    // Revert the task
    setTasks((prev) =>
      prev.map((task) =>
        task.id === lastAction.taskId ? lastAction.previousState : task
      )
    );

    // Update on server
    api.task.updateTask(lastAction.taskId, {
      status: lastAction.previousState.status,
    });
  }, [undoStack]);

  const canUndo = undoStack.length > 0;

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    undoLastAction,
    canUndo,
    // Include optimistic updates for debugging/monitoring
    optimisticUpdates,
  };
}

// Hook for optimistic updates
export function useOptimistic<T>(
  initialValue: T
): [T, (newValue: T) => void, () => void, () => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [optimisticValue, setOptimisticValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);

  const setOptimistic = useCallback((newValue: T) => {
    setOptimisticValue(newValue);
    setIsPending(true);
  }, []);

  const commit = useCallback(() => {
    setValue(optimisticValue);
    setIsPending(false);
  }, [optimisticValue]);

  const rollback = useCallback(() => {
    setOptimisticValue(value);
    setIsPending(false);
  }, [value]);

  return [
    isPending ? optimisticValue : value,
    setOptimistic,
    rollback,
    commit,
    isPending,
  ];
}

// Hook for debounced search
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for local storage
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Hook for keyboard shortcuts
export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      const pressedKeys = [
        event.ctrlKey && "ctrl",
        event.metaKey && "cmd",
        event.altKey && "alt",
        event.shiftKey && "shift",
        event.key.toLowerCase(),
      ].filter(Boolean);

      const isMatch = keys.every((key) =>
        pressedKeys.includes(key.toLowerCase())
      );

      if (isMatch) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [keys, callback, enabled]);
}

// Hook for online/offline detection
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
