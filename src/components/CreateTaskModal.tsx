"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, AlertCircle, CheckCircle } from "lucide-react";
import { CreateTaskInput, TaskPriority } from "@/lib/types";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: CreateTaskInput) => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [isAnimating, setIsAnimating] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  // Handle modal animations
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Focus the title input after animation
      const timer = setTimeout(() => {
        const titleInput = document.querySelector(
          "#task-title"
        ) as HTMLInputElement;
        titleInput?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (description && description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (title.trim()) {
      onCreate({
        title: title.trim(),
        description: description.trim(),
        priority,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setErrors({});

      // Close modal with animation
      setIsAnimating(false);
      setTimeout(() => {
        onClose();
      }, 200);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      // Reset form after modal is closed
      setTitle("");
      setDescription("");
      setPriority("medium");
      setErrors({});
    }, 200);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  const priorityOptions = [
    {
      value: "low" as const,
      label: "Low Priority",
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-700",
    },
    {
      value: "medium" as const,
      label: "Medium Priority",
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      value: "high" as const,
      label: "High Priority",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/20 backdrop-blur-sm
        transition-all duration-300
        ${isAnimating && isOpen ? "opacity-100" : "opacity-0"}
      `}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`
          bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full
          border border-gray-200/50 dark:border-gray-700/50
          transform transition-all duration-300 ease-out
          ${
            isAnimating && isOpen
              ? "scale-100 translate-y-0"
              : "scale-95 translate-y-8"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create New Task
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add a new task to your board
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Field */}
          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300"
            >
              Task Title *
            </label>
            <div className="relative">
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                className={`
                  w-full px-4 py-3 border rounded-xl
                  bg-gray-50 dark:bg-gray-700 
                  text-gray-900 dark:text-white 
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30
                  focus:border-blue-500 dark:focus:border-blue-400
                  transition-all duration-200
                  ${
                    errors.title
                      ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600"
                  }
                `}
                placeholder="Enter task title..."
                maxLength={100}
                required
              />
              {errors.title && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.title && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
              {title.length}/100 characters
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="task-description"
              className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <div className="relative">
              <textarea
                id="task-description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
                className={`
                  w-full px-4 py-3 border rounded-xl resize-none
                  bg-gray-50 dark:bg-gray-700
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30
                  focus:border-blue-500 dark:focus:border-blue-400
                  transition-all duration-200
                  ${
                    errors.description
                      ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600"
                  }
                `}
                rows={4}
                placeholder="Describe your task (optional)..."
                maxLength={500}
              />
              {errors.description && (
                <div className="absolute right-3 top-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
              {description.length}/500 characters
            </div>
          </div>

          {/* Priority Field */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
              Priority Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {priorityOptions.map((option) => (
                <label
                  key={option.value}
                  className={`
                    relative flex items-center p-4 border-2 rounded-xl cursor-pointer
                    transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600
                    ${
                      priority === option.value
                        ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700"
                    }
                  `}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={priority === option.value}
                    onChange={(e) =>
                      setPriority(e.target.value as TaskPriority)
                    }
                    className="sr-only"
                  />
                  <div className="flex items-center w-full">
                    <div
                      className={`
                      w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0
                      ${
                        priority === option.value
                          ? "border-blue-500 dark:border-blue-400 bg-blue-500 dark:bg-blue-400"
                          : "border-gray-300 dark:border-gray-600"
                      }
                    `}
                    >
                      {priority === option.value && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${option.color}`}>
                        {option.value.charAt(0).toUpperCase() +
                          option.value.slice(1)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.label.replace(" Priority", "")}
                      </div>
                    </div>
                  </div>
                  {priority === option.value && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-600 dark:disabled:to-gray-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:transform-none transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Create Task
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
