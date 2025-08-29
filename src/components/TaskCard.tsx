"use client";

import React from "react";
import { Task } from "@/lib/types";
import { priorityConfig } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onFocus?: () => void;
  isFocused?: boolean;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

export function TaskCard({
  task,
  isDragging,
  onFocus,
  isFocused,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: TaskCardProps) {
  const priority = priorityConfig[task.priority];

  return (
    <div
      tabIndex={0}
      onClick={onFocus}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`
        group p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm
        border-2 transition-all duration-200 cursor-grab active:cursor-grabbing
        select-none touch-none
        ${
          isDragging
            ? "opacity-30 transform scale-95 rotate-1 shadow-xl border-blue-300 dark:border-blue-600"
            : "hover:shadow-md hover:scale-[1.02]"
        }
        ${
          isFocused
            ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white flex-1 pr-2">
          {task.title}
        </h3>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center justify-between">
        <span
          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${priority.className}`}
        >
          {task.priority}
        </span>

        {isDragging && (
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Dragging...
          </span>
        )}
      </div>
    </div>
  );
}
