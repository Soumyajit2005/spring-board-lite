"use client";

import React, { useState } from "react";
import { Task } from "@/lib/types";
import { priorityConfig } from "@/lib/utils";
import { GripVertical, Trash2, Calendar, Clock } from "lucide-react";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onFocus?: () => void;
  isFocused?: boolean;
  onDelete?: (taskId: string) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

export function TaskCard({
  task,
  isDragging,
  onFocus,
  isFocused,
  onDelete,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: TaskCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const priority = priorityConfig[task.priority];

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete?.(task.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      tabIndex={0}
      onClick={onFocus}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`
        group relative p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm
        border transition-all duration-300 cursor-grab active:cursor-grabbing
        select-none touch-none overflow-hidden
        ${
          isDragging
            ? "opacity-30 transform scale-95 rotate-1 shadow-2xl border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:-translate-y-1"
        }
        ${
          isFocused
            ? "border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30 shadow-lg"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        }
        before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r
        ${
          priority.color === "red"
            ? "before:from-red-400 before:to-red-500"
            : priority.color === "yellow"
            ? "before:from-yellow-400 before:to-yellow-500"
            : "before:from-gray-400 before:to-gray-500"
        }
      `}
    >
      {/* Priority Indicator Strip */}
      <div
        className={`absolute top-0 left-0 w-full h-1 ${
          priority.color === "red"
            ? "bg-gradient-to-r from-red-400 to-red-500"
            : priority.color === "yellow"
            ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
            : "bg-gradient-to-r from-gray-400 to-gray-500"
        }`}
      />

      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white flex-1 pr-2 text-sm leading-relaxed">
          {task.title}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={handleDeleteClick}
            className={`
              p-1.5 rounded-lg transition-all duration-200 flex-shrink-0
              ${
                showDeleteConfirm
                  ? "bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
              }
            `}
            title={
              showDeleteConfirm
                ? "Click again to confirm delete"
                : "Delete task"
            }
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="p-1 opacity-60">
            <GripVertical className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${priority.className}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              priority.color === "red"
                ? "bg-red-500"
                : priority.color === "yellow"
                ? "bg-yellow-500"
                : "bg-gray-500"
            }`}
          />
          {task.priority}
        </span>

        {/* Task metadata */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div
            className="flex items-center gap-1"
            title={`Created: ${formatDate(task.createdAt)}`}
          >
            <Calendar className="w-3 h-3" />
            <span className="hidden sm:inline">
              {new Date(task.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          {task.updatedAt !== task.createdAt && (
            <div
              className="flex items-center gap-1"
              title={`Updated: ${formatDate(task.updatedAt)}`}
            >
              <Clock className="w-3 h-3" />
              <span className="hidden sm:inline">
                {new Date(task.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
              Delete this task?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleDeleteClick}
                className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isDragging && (
        <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Dragging...
          </span>
        </div>
      )}
    </div>
  );
}
