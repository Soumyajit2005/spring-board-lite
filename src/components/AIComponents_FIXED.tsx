"use client";

import React, { useState } from "react";
import {
  Bot,
  Clock,
  Tag,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useAI } from "@/hooks/useAI";
import { Task } from "@/lib/types";

interface AITaskEnhancementProps {
  task: Task;
  onEnhance?: (enhancement: any) => void;
}

export function AITaskEnhancement({ task, onEnhance }: AITaskEnhancementProps) {
  const {
    categorizeTask,
    estimateTaskTime,
    enhanceTaskDescription,
    isProcessing,
    isAIAvailable,
  } = useAI();

  const [showEnhancements, setShowEnhancements] = useState(false);
  const [enhancements, setEnhancements] = useState<Record<string, any>>({});

  if (!isAIAvailable) {
    return null; // Hide if AI not available
  }

  const handleCategorize = async () => {
    const result = await categorizeTask(task);
    if (result) {
      setEnhancements((prev: Record<string, any>) => ({
        ...prev,
        categorization: result,
      }));
      onEnhance?.(result);
    }
  };

  const handleEstimateTime = async () => {
    const result = await estimateTaskTime(task);
    if (result) {
      setEnhancements((prev: Record<string, any>) => ({
        ...prev,
        estimation: result,
      }));
      onEnhance?.(result);
    }
  };

  const handleEnhanceDescription = async () => {
    const result = await enhanceTaskDescription(task);
    if (result) {
      setEnhancements((prev: Record<string, any>) => ({
        ...prev,
        enhancement: result,
      }));
      onEnhance?.(result);
    }
  };

  return (
    <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
          AI Enhancements
        </span>
        <button
          onClick={() => setShowEnhancements(!showEnhancements)}
          className="ml-auto text-xs px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors"
        >
          {showEnhancements ? "Hide" : "Show"}
        </button>
      </div>

      {showEnhancements && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleCategorize}
              disabled={isProcessing}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors disabled:opacity-50"
            >
              <Tag className="w-3 h-3" />
              Categorize
            </button>

            <button
              onClick={handleEstimateTime}
              disabled={isProcessing}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors disabled:opacity-50"
            >
              <Clock className="w-3 h-3" />
              Estimate
            </button>

            <button
              onClick={handleEnhanceDescription}
              disabled={isProcessing}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-800/50 transition-colors disabled:opacity-50"
            >
              <Lightbulb className="w-3 h-3" />
              Enhance
            </button>
          </div>

          {/* Show enhancement results */}
          {Object.keys(enhancements).length > 0 && (
            <div className="mt-3 space-y-2">
              {enhancements.categorization && (
                <div className="text-xs p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <strong>Category:</strong>{" "}
                  {enhancements.categorization.category}
                  <br />
                  <strong>Confidence:</strong>{" "}
                  {Math.round(enhancements.categorization.confidence * 100)}%
                </div>
              )}

              {enhancements.estimation && (
                <div className="text-xs p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <strong>Estimated Time:</strong>{" "}
                  {enhancements.estimation.estimatedHours} hours
                  <br />
                  <strong>Confidence:</strong>{" "}
                  {Math.round(enhancements.estimation.confidence * 100)}%
                </div>
              )}

              {enhancements.enhancement && (
                <div className="text-xs p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                  <strong>Enhanced Description:</strong>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    {enhancements.enhancement.enhancedDescription}
                  </p>
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
              <div className="w-3 h-3 border border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
              AI is analyzing...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// AI Insights Panel Component - Simple version without dropdown
interface AIInsightsPanelProps {
  insights: any[];
  onDismiss?: (insightIndex: number) => void;
}

export function AIInsightsPanel({ insights, onDismiss }: AIInsightsPanelProps) {
  if (insights.length === 0) return null;

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "burnout_warning":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "productivity_trend":
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case "completion_probability":
        return <Clock className="w-4 h-4 text-green-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-purple-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
      case "medium":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800";
    }
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-2">
        <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="font-medium text-gray-900 dark:text-white">
          AI Insights
        </h3>
      </div>

      {insights.map((insight, index) => (
        <div
          key={index}
          className={`rounded-lg p-4 border ${getSeverityColor(
            insight.severity
          )}`}
        >
          <div className="flex items-start gap-3">
            {getInsightIcon(insight.type)}
            <div className="flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                {insight.message}
              </p>

              {insight.actions && insight.actions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Recommended Actions:
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
                    {insight.actions.map(
                      (action: string, actionIndex: number) => (
                        <li key={actionIndex}>{action}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>

            {onDismiss && (
              <button
                onClick={() => onDismiss(index)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
