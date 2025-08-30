"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Settings, Bot, Save, RotateCcw, ChevronDown } from "lucide-react";
import { useAI } from "@/hooks/useAI";

export function AISettingsPanel() {
  const { settings, updateSettings, isAIAvailable } = useAI();
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted (for SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal when pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  // Update local settings when main settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isAIAvailable) {
    return null;
  }

  const handleSave = () => {
    updateSettings(localSettings);
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultSettings = {
      autoEnhanceDescriptions: true,
      showTimeEstimates: true,
      enableSuggestions: true,
      weeklyReports: true,
    };
    setLocalSettings(defaultSettings);
  };

  const modalContent = (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm cursor-pointer"
        style={{
          zIndex: 2147483646,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div
        className="fixed right-4 top-20 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 cursor-default"
        style={{
          zIndex: 2147483647,
          position: "fixed",
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200 dark:border-gray-600">
          <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Settings
          </h3>
        </div>

        <div className="space-y-5">
          {/* Auto-Enhance Descriptions */}
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Auto-Enhance Descriptions
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically improve task descriptions for clarity
              </p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.autoEnhanceDescriptions}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  autoEnhanceDescriptions: e.target.checked,
                })
              }
              className="mt-1 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Show Time Estimates */}
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Show Time Estimates
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Display AI-powered time estimates for tasks
              </p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.showTimeEstimates}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  showTimeEstimates: e.target.checked,
                })
              }
              className="mt-1 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Enable Suggestions */}
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Enable Task Suggestions
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get AI suggestions for new tasks based on your work
              </p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.enableSuggestions}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  enableSuggestions: e.target.checked,
                })
              }
              className="mt-1 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Weekly Reports */}
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Weekly Reports
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive AI-generated productivity reports
              </p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.weeklyReports}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  weeklyReports: e.target.checked,
                })
              }
              className="mt-1 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <div className="flex-1" />

          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="AI Settings"
      >
        <Bot className="w-4 h-4" />
        <Settings className="w-4 h-4" />
        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Portal Modal - Rendered at document.body level to escape stacking context */}
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
