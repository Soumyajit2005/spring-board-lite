"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, LogOut, Moon, Sun, AlertCircle } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { TaskCard, CreateTaskModal, Toast, UndoOverlay } from "@/components";
import { Task, TaskStatus, TaskPriority } from "@/lib/types";
import { filterTasks } from "@/lib/utils";

export default function BoardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { tasks, loading, createTask, moveTask, undoLastAction, canUndo } =
    useTasks();

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
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

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

  const columns = [
    {
      id: "todo" as const,
      title: "Todo",
      tasks: filteredTasks.filter((t) => t.status === "todo"),
    },
    {
      id: "in-progress" as const,
      title: "In Progress",
      tasks: filteredTasks.filter((t) => t.status === "in-progress"),
    },
    {
      id: "done" as const,
      title: "Done",
      tasks: filteredTasks.filter((t) => t.status === "done"),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sprint Board
          </h1>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, <span className="font-medium">{user.fullName}</span>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800"
            />
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        {/* Drag and Drop Instructions */}
        {tasks.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  🖱️ <strong>Drag</strong> tasks between columns
                </span>
                <span className="flex items-center gap-1">
                  ⌨️ Use{" "}
                  <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">
                    [ ]
                  </kbd>{" "}
                  keys to move focused tasks
                </span>
                <span className="flex items-center gap-1">
                  🔄 <strong>Undo</strong> available after moves
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`
                bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[400px] transition-all duration-200
                ${
                  dropTarget === column.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 border-dashed"
                    : "border-2 border-transparent"
                }
                ${
                  draggedTask && draggedTask.status === column.id
                    ? "opacity-50"
                    : ""
                }
              `}
            >
              <h2 className="font-semibold mb-4 flex items-center justify-between">
                <span>
                  {column.title} ({column.tasks.length})
                </span>
                {dropTarget === column.id && draggedTask && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Drop here
                  </span>
                )}
              </h2>
              <div className="space-y-3">
                {column.tasks.length === 0 ? (
                  <div
                    className={`
                    text-center py-8 rounded-lg transition-colors duration-200
                    ${
                      dropTarget === column.id
                        ? "text-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                        : "text-gray-400"
                    }
                  `}
                  >
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>
                      {dropTarget === column.id
                        ? "Drop task here"
                        : "No tasks here"}
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
                        transition-all duration-200 transform
                        ${
                          draggedTask?.id === task.id
                            ? "opacity-50 scale-95 rotate-2"
                            : "hover:scale-[1.02]"
                        }
                      `}
                    >
                      <TaskCard
                        task={task}
                        isDragging={draggedTask?.id === task.id}
                        onFocus={() => setFocusedTaskId(task.id)}
                        isFocused={focusedTaskId === task.id}
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
