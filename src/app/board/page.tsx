"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, LogOut, Moon, Sun, AlertCircle } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useAI } from "@/hooks/useAI";
import {
  TaskCard,
  CreateTaskModal,
  Toast,
  UndoOverlay,
  AIInsightsPanel,
} from "@/components";
import { AISettingsPanel } from "@/components/AISettings";
import { Task, TaskStatus, TaskPriority } from "@/lib/types";
import { filterTasks } from "@/lib/utils";

export default function BoardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const {
    tasks,
    loading,
    createTask,
    moveTask,
    deleteTask,
    undoLastAction,
    canUndo,
  } = useTasks();
  const {
    insights,
    analyzeProductivity,
    dismissInsight,
    regenerateInsights,
    isProcessing,
    isAIAvailable,
  } = useAI();

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">(
    "all"
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "undo";
  } | null>(null);
  const [showUndoOverlay, setShowUndoOverlay] = useState(false);
  const [undoMessage, setUndoMessage] = useState("");
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // AI Productivity Analysis - Run when tasks change
  useEffect(() => {
    if (tasks.length > 0 && isAIAvailable) {
      // Debounce the analysis to avoid too many API calls
      const timeoutId = setTimeout(() => {
        analyzeProductivity(tasks);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
    return () => {}; // Always return a cleanup function
  }, [tasks, isAIAvailable, analyzeProductivity]);

  // Keyboard navigation with enhanced drag and drop support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!focusedTaskId) return;

      const task = tasks.find((t) => t.id === focusedTaskId);
      if (!task) return;

      const statusOrder: TaskStatus[] = ["todo", "in-progress", "done"];
      const currentIndex = statusOrder.indexOf(task.status);

      if (e.key === "[" && currentIndex > 0) {
        e.preventDefault();
        const newStatus = statusOrder[currentIndex - 1];
        moveTask(focusedTaskId, newStatus);

        // Show undo overlay
        const statusDisplayName = newStatus.replace("-", " ");
        const message = `Task "${task.title}" moved to ${statusDisplayName}`;
        setUndoMessage(message);
        setShowUndoOverlay(true);
      } else if (e.key === "]" && currentIndex < statusOrder.length - 1) {
        e.preventDefault();
        const newStatus = statusOrder[currentIndex + 1];
        moveTask(focusedTaskId, newStatus);

        // Show undo overlay
        const statusDisplayName = newStatus.replace("-", " ");
        const message = `Task "${task.title}" moved to ${statusDisplayName}`;
        setUndoMessage(message);
        setShowUndoOverlay(true);
      }

      // ESC to cancel any ongoing drag operation
      if (e.key === "Escape" && draggedTask) {
        setDraggedTask(null);
        setDropTarget(null);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [focusedTaskId, tasks, moveTask, draggedTask]);

  // Filter tasks
  const filteredTasks = filterTasks(tasks, {
    searchQuery,
    priority: priorityFilter,
  });

  // Calculate stats manually
  const stats = {
    total: filteredTasks.length,
    todo: filteredTasks.filter((t) => t.status === "todo").length,
    inProgress: filteredTasks.filter((t) => t.status === "in-progress").length,
    done: filteredTasks.filter((t) => t.status === "done").length,
    completionRate:
      filteredTasks.length > 0
        ? Math.round(
            (filteredTasks.filter((t) => t.status === "done").length /
              filteredTasks.length) *
              100
          )
        : 0,
  };

  const columns = [
    {
      id: "todo" as const,
      title: "📝 Todo",
      description: "Tasks to be started",
      tasks: filteredTasks.filter((t) => t.status === "todo"),
      color: "from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700",
      borderColor: "border-gray-200 dark:border-gray-600",
      textColor: "text-gray-700 dark:text-gray-300",
    },
    {
      id: "in-progress" as const,
      title: "🚀 In Progress",
      description: "Work in progress",
      tasks: filteredTasks.filter((t) => t.status === "in-progress"),
      color:
        "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30",
      borderColor: "border-blue-200 dark:border-blue-700",
      textColor: "text-blue-700 dark:text-blue-300",
    },
    {
      id: "done" as const,
      title: "✅ Done",
      description: "Completed tasks",
      tasks: filteredTasks.filter((t) => t.status === "done"),
      color:
        "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30",
      borderColor: "border-green-200 dark:border-green-700",
      textColor: "text-green-700 dark:text-green-300",
    },
  ];

  // Drag handlers with enhanced functionality
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);

    // Create a custom drag image
    const dragElement = e.currentTarget as HTMLElement;
    const rect = dragElement.getBoundingClientRect();
    e.dataTransfer.setDragImage(dragElement, rect.width / 2, rect.height / 2);

    // Add visual feedback class
    setTimeout(() => {
      dragElement.classList.add("dragging");
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const dragElement = e.currentTarget as HTMLElement;
    dragElement.classList.remove("dragging");
    setDraggedTask(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      setDropTarget(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // Only clear drop target if we're actually leaving the column
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDropTarget(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDropTarget(null);

    if (draggedTask && draggedTask.status !== status) {
      try {
        await moveTask(draggedTask.id, status);

        // Show the undo overlay at center instead of toast
        const statusDisplayName = status.replace("-", " ");
        const message = `Task "${draggedTask.title}" moved to ${statusDisplayName}`;
        setUndoMessage(message);
        setShowUndoOverlay(true);
      } catch (error) {
        setToast({
          message: "Failed to move task",
          type: "error",
        });
      }
    }
    setDraggedTask(null);
  };

  const handleCreateTask = async (input: any) => {
    try {
      await createTask(input);
      setToast({ message: "Task created successfully", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to create task", type: "error" });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      await deleteTask(taskId);
      setToast({
        message: `Task "${task?.title}" deleted successfully`,
        type: "success",
      });
    } catch (error) {
      setToast({ message: "Failed to delete task", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your tasks...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Sprint Board
              </h1>
              {user && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>👤</span>
                  <span>
                    Welcome,{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.fullName}
                    </span>
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Quick Stats - Simplified without missing functions */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300">
                  <span>
                    {tasks.filter((t) => t.status === "done").length} Complete
                  </span>
                </div>
              </div>

              {/* AI Settings Button */}
              {isAIAvailable && <AISettingsPanel />}

              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 dark:focus:border-blue-400 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Tasks
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.inProgress}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">🚀</span>
              </div>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.done}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats.completionRate}%
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drag and Drop Instructions */}
        {tasks.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-5 mb-8 backdrop-blur-sm">
            <div className="flex items-center gap-4 text-blue-800 dark:text-blue-200">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">💡</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <strong>Drag</strong> tasks between columns
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Use{" "}
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs border border-blue-200 dark:border-blue-700">
                    [ ]
                  </kbd>{" "}
                  keys to move focused tasks
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <strong>Undo</strong> available after moves
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Dropdown */}
        {isAIAvailable && insights.length > 0 && (
          <AIInsightsPanel
            insights={insights}
            onDismiss={(insightIndex) => dismissInsight(insightIndex)}
            onRegenerate={async () => {
              await regenerateInsights(tasks);
            }}
            isRegenerating={isProcessing}
          />
        )}

        {/* Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {columns.map((column) => (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`
                relative rounded-2xl p-6 min-h-[500px] transition-all duration-300 backdrop-blur-sm
                bg-gradient-to-br ${column.color}
                border-2 ${
                  dropTarget === column.id
                    ? `${column.borderColor} border-dashed shadow-xl shadow-blue-200/50 dark:shadow-blue-900/50 scale-105`
                    : `${column.borderColor} border-solid shadow-lg`
                }
                ${
                  draggedTask && draggedTask.status === column.id
                    ? "opacity-50 scale-95"
                    : ""
                }
              `}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-xl font-bold ${column.textColor} mb-1`}>
                    {column.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {column.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${column.textColor} bg-white/60 dark:bg-gray-800/60`}
                    >
                      {column.tasks.length}{" "}
                      {column.tasks.length === 1 ? "task" : "tasks"}
                    </span>
                    {dropTarget === column.id && draggedTask && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 animate-pulse">
                        Drop here
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-4">
                {column.tasks.length === 0 ? (
                  <div
                    className={`
                      text-center py-12 rounded-xl transition-all duration-300
                      ${
                        dropTarget === column.id
                          ? "bg-blue-100/60 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-600 border-dashed"
                          : "bg-white/30 dark:bg-gray-800/30 border-2 border-gray-200/50 dark:border-gray-700/50 border-dashed"
                      }
                    `}
                  >
                    <div className="mb-4">
                      {dropTarget === column.id ? (
                        <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                          <span className="text-2xl">📥</span>
                        </div>
                      ) : (
                        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        dropTarget === column.id
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {dropTarget === column.id
                        ? "Drop your task here"
                        : `No ${column.title
                            .split(" ")[1]
                            ?.toLowerCase()} tasks yet`}
                    </p>
                  </div>
                ) : (
                  column.tasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={`
                        transition-all duration-300 transform
                        ${
                          draggedTask?.id === task.id
                            ? "opacity-50 scale-95 rotate-1 z-30"
                            : "hover:scale-[1.02] hover:-translate-y-1"
                        }
                      `}
                    >
                      <TaskCard
                        task={task}
                        isDragging={draggedTask?.id === task.id}
                        onFocus={() => setFocusedTaskId(task.id)}
                        isFocused={focusedTaskId === task.id}
                        onDelete={handleDeleteTask}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTask}
      />

      {/* Undo Overlay - Centered modal for undo actions */}
      {showUndoOverlay && canUndo && (
        <UndoOverlay
          message={undoMessage}
          onUndo={() => {
            undoLastAction();
            setShowUndoOverlay(false);
            setToast({
              message: "Task move undone",
              type: "success",
            });
          }}
          onClose={() => setShowUndoOverlay(false)}
          duration={5000}
        />
      )}

      {/* Regular toast for other notifications */}
      {toast && toast.type !== "undo" && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
