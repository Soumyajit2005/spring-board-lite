"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  LogOut,
  Moon,
  Sun,
  BarChart3,
  TestTube,
  RefreshCw,
  Network,
  Settings,
  PanelLeftOpen,
  PanelLeftClose,
  Lightbulb,
  Eye,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useAI } from "@/hooks/useAI";
import {
  TaskCard,
  CreateTaskModal,
  Toast,
  UndoOverlay,
  SmartSchedulerPanel,
  ProductivityDashboard,
  SmartCodeReviewPanel,
  TestingDashboard,
  RefactoringDashboard,
  TaskDependencyVisualizer,
  CodeInsightsPanel,
} from "@/components";
import { AISettingsPanel } from "@/components/AISettings";
import { Task, TaskStatus, TaskPriority } from "@/lib/types";
import { filterTasks } from "@/lib/utils";

type PanelType =
  | "scheduler"
  | "productivity"
  | "review"
  | "testing"
  | "refactor"
  | "dependencies"
  | "insights"
  | "settings";

export default function BoardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const {
    tasks,
    loading,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    undoLastAction,
    canUndo,
  } = useTasks();
  const { insights, analyzeProductivity, isProcessing, isAIAvailable } =
    useAI();

  // UI State
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

  // Sidebar and panel states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelType>("scheduler");

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // AI Productivity Analysis
  useEffect(() => {
    if (tasks.length > 0 && isAIAvailable) {
      const timeoutId = setTimeout(() => {
        analyzeProductivity(tasks);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
    // No cleanup needed when conditions aren't met
    return undefined;
  }, [tasks, isAIAvailable, analyzeProductivity]);

  // Keyboard navigation
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
        const statusDisplayName = newStatus.replace("-", " ");
        const message = `Task "${task.title}" moved to ${statusDisplayName}`;
        setUndoMessage(message);
        setShowUndoOverlay(true);
      } else if (e.key === "]" && currentIndex < statusOrder.length - 1) {
        e.preventDefault();
        const newStatus = statusOrder[currentIndex + 1];
        moveTask(focusedTaskId, newStatus);
        const statusDisplayName = newStatus.replace("-", " ");
        const message = `Task "${task.title}" moved to ${statusDisplayName}`;
        setUndoMessage(message);
        setShowUndoOverlay(true);
      }

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
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  });

  // Task handlers
  const handleTaskCreate = async (taskData: any) => {
    try {
      await createTask(taskData);
      setIsCreateModalOpen(false);
      setToast({ message: "Task created successfully", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to create task", type: "error" });
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
      setToast({ message: "Task updated successfully", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to update task", type: "error" });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      await deleteTask(taskId);
      setUndoMessage(`Task "${task.title}" deleted`);
      setShowUndoOverlay(true);
    } catch (error) {
      setToast({ message: "Failed to delete task", type: "error" });
    }
  };

  const handleUndo = () => {
    if (canUndo) {
      undoLastAction();
      setShowUndoOverlay(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDropTarget(status);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      moveTask(draggedTask.id, status);
      const statusDisplayName = status.replace("-", " ");
      setUndoMessage(
        `Task "${draggedTask.title}" moved to ${statusDisplayName}`
      );
      setShowUndoOverlay(true);
    }
    setDraggedTask(null);
    setDropTarget(null);
  };

  const renderPanel = () => {
    switch (activePanel) {
      case "scheduler":
        return (
          <SmartSchedulerPanel tasks={tasks} onTaskUpdate={handleTaskUpdate} />
        );
      case "productivity":
        return <ProductivityDashboard tasks={tasks} />;
      case "review":
        return <SmartCodeReviewPanel tasks={tasks} />;
      case "testing":
        return <TestingDashboard tasks={tasks} />;
      case "refactor":
        return <RefactoringDashboard tasks={tasks} />;
      case "dependencies":
        return <TaskDependencyVisualizer tasks={tasks} />;
      case "insights":
        return (
          <CodeInsightsPanel tasks={tasks} onTaskUpdate={handleTaskUpdate} />
        );
      case "settings":
        return <AISettingsPanel />;
      default:
        return (
          <SmartSchedulerPanel tasks={tasks} onTaskUpdate={handleTaskUpdate} />
        );
    }
  };

  const panelOptions: Array<{
    key: PanelType;
    label: string;
    icon: any;
    color: string;
  }> = [
    {
      key: "scheduler",
      label: "Smart Scheduler",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      key: "productivity",
      label: "Analytics",
      icon: BarChart3,
      color: "text-green-600",
    },
    {
      key: "review",
      label: "Code Review",
      icon: Eye,
      color: "text-purple-600",
    },
    { key: "testing", label: "Testing", icon: TestTube, color: "text-red-600" },
    {
      key: "refactor",
      label: "Refactoring",
      icon: RefreshCw,
      color: "text-indigo-600",
    },
    {
      key: "dependencies",
      label: "Dependencies",
      icon: Network,
      color: "text-emerald-600",
    },
    {
      key: "insights",
      label: "Code Insights",
      icon: Lightbulb,
      color: "text-yellow-600",
    },
    {
      key: "settings",
      label: "Settings",
      icon: Settings,
      color: "text-gray-600",
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <PanelLeftClose className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sprint Board Lite
              </h1>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full">
                AI-Powered
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as TaskPriority | "all")
                }
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              {/* Create Task Button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user?.email}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Developer
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* AI Sidebar */}
        <div
          className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ${
            sidebarCollapsed ? "w-16" : "w-80"
          } flex-shrink-0`}
        >
          {/* Panel Navigation */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            {sidebarCollapsed ? (
              <div className="space-y-2">
                {panelOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.key}
                      onClick={() => setActivePanel(option.key)}
                      className={`w-full p-2 rounded-lg transition-colors ${
                        activePanel === option.key
                          ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      title={option.label}
                    >
                      <Icon className="w-5 h-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
                  AI Assistant Panels
                </h2>
                {panelOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.key}
                      onClick={() => setActivePanel(option.key)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        activePanel === option.key
                          ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${option.color}`} />
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel Content */}
          {!sidebarCollapsed && (
            <div className="p-4 h-full overflow-y-auto">{renderPanel()}</div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* AI Insights Bar */}
          {insights.length > 0 && isAIAvailable && (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5" />
                  <div>
                    <div className="font-medium">AI Productivity Insights</div>
                    <div className="text-sm opacity-90">
                      {insights[0]?.message ||
                        "Analyzing your productivity patterns..."}
                    </div>
                  </div>
                </div>
                {isProcessing && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm">Processing...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Task Board */}
          <div className="p-6 h-full overflow-y-auto">
            <div className="grid grid-cols-3 gap-6 h-full">
              {/* Todo Column */}
              <div
                className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg ${
                  dropTarget === "todo"
                    ? "ring-2 ring-blue-500 bg-blue-50/80 dark:bg-blue-900/20"
                    : ""
                }`}
                onDragOver={(e) => handleDragOver(e, "todo")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "todo")}
              >
                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      To Do
                    </h3>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-sm">
                      {filteredTasks.filter((t) => t.status === "todo").length}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3 h-[calc(100%-80px)] overflow-y-auto">
                  {filteredTasks
                    .filter((task) => task.status === "todo")
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDelete={handleTaskDelete}
                        onFocus={() => setFocusedTaskId(task.id)}
                        isFocused={focusedTaskId === task.id}
                        isDragging={draggedTask?.id === task.id}
                        onDragStart={() => handleDragStart(task)}
                      />
                    ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div
                className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg ${
                  dropTarget === "in-progress"
                    ? "ring-2 ring-yellow-500 bg-yellow-50/80 dark:bg-yellow-900/20"
                    : ""
                }`}
                onDragOver={(e) => handleDragOver(e, "in-progress")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "in-progress")}
              >
                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      In Progress
                    </h3>
                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full text-sm">
                      {
                        filteredTasks.filter((t) => t.status === "in-progress")
                          .length
                      }
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3 h-[calc(100%-80px)] overflow-y-auto">
                  {filteredTasks
                    .filter((task) => task.status === "in-progress")
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDelete={handleTaskDelete}
                        onFocus={() => setFocusedTaskId(task.id)}
                        isFocused={focusedTaskId === task.id}
                        isDragging={draggedTask?.id === task.id}
                        onDragStart={() => handleDragStart(task)}
                      />
                    ))}
                </div>
              </div>

              {/* Done Column */}
              <div
                className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg ${
                  dropTarget === "done"
                    ? "ring-2 ring-green-500 bg-green-50/80 dark:bg-green-900/20"
                    : ""
                }`}
                onDragOver={(e) => handleDragOver(e, "done")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "done")}
              >
                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Done
                    </h3>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-sm">
                      {filteredTasks.filter((t) => t.status === "done").length}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3 h-[calc(100%-80px)] overflow-y-auto">
                  {filteredTasks
                    .filter((task) => task.status === "done")
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDelete={handleTaskDelete}
                        onFocus={() => setFocusedTaskId(task.id)}
                        isFocused={focusedTaskId === task.id}
                        isDragging={draggedTask?.id === task.id}
                        onDragStart={() => handleDragStart(task)}
                      />
                    ))}
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Plus className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery || priorityFilter !== "all"
                    ? "No tasks match your filters"
                    : "Ready to boost your productivity?"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {searchQuery || priorityFilter !== "all"
                    ? "Try adjusting your search or filters to find more tasks."
                    : "Create your first task and let our AI-powered features help you stay organized and efficient."}
                </p>
                {!searchQuery && priorityFilter === "all" && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Create Your First Task
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals and Overlays */}
      {isCreateModalOpen && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleTaskCreate}
        />
      )}

      {showUndoOverlay && (
        <UndoOverlay
          message={undoMessage}
          onUndo={handleUndo}
          onClose={() => setShowUndoOverlay(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
