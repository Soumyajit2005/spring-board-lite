import { useState, useEffect, useCallback } from "react";
import { aiService, AIProductivityInsight } from "@/lib/ai";
import { Task } from "@/lib/types";
import { useLocalStorage } from "./useTasks";

export interface AIState {
  insights: AIProductivityInsight[];
  taskEnhancements: Map<string, any>;
  isProcessing: boolean;
  lastAnalysis: number | null;
  settings: {
    autoEnhanceDescriptions: boolean;
    showTimeEstimates: boolean;
    enableSuggestions: boolean;
    weeklyReports: boolean;
  };
}

export function useAI() {
  const [aiState, setAIState] = useState<AIState>({
    insights: [],
    taskEnhancements: new Map(),
    isProcessing: false,
    lastAnalysis: null,
    settings: {
      autoEnhanceDescriptions: true,
      showTimeEstimates: true,
      enableSuggestions: true,
      weeklyReports: true,
    },
  });

  const [aiSettings, setAISettings] = useLocalStorage(
    "ai-settings",
    aiState.settings
  );

  // Update settings when localStorage changes
  useEffect(() => {
    setAIState((prev) => ({ ...prev, settings: aiSettings }));
  }, [aiSettings]);

  // Check if AI is available
  const isAIAvailable = useCallback(() => {
    return aiService.isAvailable();
  }, []);

  // Categorize task
  const categorizeTask = useCallback(
    async (task: Pick<Task, "title" | "description">) => {
      if (!isAIAvailable()) return null;

      try {
        setAIState((prev) => ({ ...prev, isProcessing: true }));
        const result = await aiService.categorizeTask(task);

        // Store enhancement for this task
        setAIState((prev) => ({
          ...prev,
          taskEnhancements: new Map(prev.taskEnhancements).set(
            `categorization-${task.title}`,
            result
          ),
          isProcessing: false,
        }));

        return result;
      } catch (error) {
        console.error("Task categorization failed:", error);
        setAIState((prev) => ({ ...prev, isProcessing: false }));
        return null;
      }
    },
    [isAIAvailable]
  );

  // Estimate task time
  const estimateTaskTime = useCallback(
    async (
      task: Pick<Task, "title" | "description" | "priority">,
      userHistory?: any
    ) => {
      if (!isAIAvailable()) return null;

      try {
        setAIState((prev) => ({ ...prev, isProcessing: true }));
        const result = await aiService.estimateTaskTime(task, userHistory);

        setAIState((prev) => ({
          ...prev,
          taskEnhancements: new Map(prev.taskEnhancements).set(
            `estimation-${task.title}`,
            result
          ),
          isProcessing: false,
        }));

        return result;
      } catch (error) {
        console.error("Task time estimation failed:", error);
        setAIState((prev) => ({ ...prev, isProcessing: false }));
        return null;
      }
    },
    [isAIAvailable]
  );

  // Enhance task description
  const enhanceTaskDescription = useCallback(
    async (task: Pick<Task, "title" | "description">) => {
      if (!isAIAvailable() || !aiState.settings.autoEnhanceDescriptions)
        return null;

      try {
        setAIState((prev) => ({ ...prev, isProcessing: true }));
        const result = await aiService.enhanceTaskDescription(task);

        setAIState((prev) => ({
          ...prev,
          taskEnhancements: new Map(prev.taskEnhancements).set(
            `enhancement-${task.title}`,
            result
          ),
          isProcessing: false,
        }));

        return result;
      } catch (error) {
        console.error("Task description enhancement failed:", error);
        setAIState((prev) => ({ ...prev, isProcessing: false }));
        return null;
      }
    },
    [isAIAvailable, aiState.settings.autoEnhanceDescriptions]
  );

  // Generate task suggestions
  const generateTaskSuggestions = useCallback(
    async (currentTasks: Task[], completedTasks: Task[]) => {
      if (!isAIAvailable() || !aiState.settings.enableSuggestions) return [];

      try {
        setAIState((prev) => ({ ...prev, isProcessing: true }));
        const suggestions = await aiService.generateTaskSuggestions(
          currentTasks,
          completedTasks,
          {}
        );

        setAIState((prev) => ({ ...prev, isProcessing: false }));
        return suggestions;
      } catch (error) {
        console.error("Task suggestions generation failed:", error);
        setAIState((prev) => ({ ...prev, isProcessing: false }));
        return [];
      }
    },
    [isAIAvailable, aiState.settings.enableSuggestions]
  );

  // Analyze productivity
  const analyzeProductivity = useCallback(
    async (tasks: Task[], forceUpdate = false) => {
      if (!isAIAvailable()) return;

      // Don't run analysis too frequently (max once per hour unless forced)
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      if (
        !forceUpdate &&
        aiState.lastAnalysis &&
        now - aiState.lastAnalysis < oneHour
      ) {
        return;
      }

      try {
        setAIState((prev) => ({ ...prev, isProcessing: true }));

        // Calculate user patterns
        const completedTasks = tasks.filter((t) => t.status === "done");
        const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
        const todoTasks = tasks.filter((t) => t.status === "todo");

        const userPatterns = {
          completionRate: completedTasks.length / tasks.length,
          averageTasksPerDay: completedTasks.length / 7, // Assuming weekly view
          highPriorityRatio:
            tasks.filter((t) => t.priority === "high").length / tasks.length,
          taskDistribution: {
            todo: todoTasks.length,
            inProgress: inProgressTasks.length,
            done: completedTasks.length,
          },
        };

        const insights = await aiService.analyzeProductivity(
          tasks,
          {},
          userPatterns
        );

        setAIState((prev) => ({
          ...prev,
          insights,
          isProcessing: false,
          lastAnalysis: now,
        }));
      } catch (error) {
        console.error("Productivity analysis failed:", error);
        setAIState((prev) => ({ ...prev, isProcessing: false }));
      }
    },
    [isAIAvailable, aiState.lastAnalysis]
  );

  // Calculate completion probability
  const calculateCompletionProbability = useCallback(
    async (tasks: Task[], deadline: Date) => {
      if (!isAIAvailable()) return null;

      try {
        setAIState((prev) => ({ ...prev, isProcessing: true }));

        const historicalData = {
          averageCompletionTime: 2, // Default 2 hours per task
          completionRate: 0.8, // 80% completion rate
        };

        const result = await aiService.calculateCompletionProbability(
          tasks,
          deadline,
          historicalData
        );

        setAIState((prev) => ({ ...prev, isProcessing: false }));
        return result;
      } catch (error) {
        console.error("Completion probability calculation failed:", error);
        setAIState((prev) => ({ ...prev, isProcessing: false }));
        return null;
      }
    },
    [isAIAvailable]
  );

  // Update AI settings
  const updateSettings = useCallback(
    (newSettings: Partial<AIState["settings"]>) => {
      const updatedSettings = { ...aiSettings, ...newSettings };
      setAISettings(updatedSettings);
    },
    [aiSettings, setAISettings]
  );

  // Clear insights
  const clearInsights = useCallback(() => {
    setAIState((prev) => ({ ...prev, insights: [] }));
  }, []);

  // Dismiss specific insight
  const dismissInsight = useCallback((insightIndex: number) => {
    setAIState((prev) => ({
      ...prev,
      insights: prev.insights.filter((_, index) => index !== insightIndex),
    }));
  }, []);

  // Regenerate insights
  const regenerateInsights = useCallback(
    async (tasks: Task[], userStats?: any) => {
      if (!isAIAvailable()) return;

      try {
        setAIState((prev) => ({ ...prev, isProcessing: true }));

        // Calculate basic stats from tasks
        const completedTasks = tasks.filter((t) => t.status === "done");
        const inProgressTasks = tasks.filter((t) => t.status === "in-progress");

        const stats = {
          totalTasks: tasks.length,
          completedCount: completedTasks.length,
          inProgressCount: inProgressTasks.length,
          completionRate:
            tasks.length > 0 ? completedTasks.length / tasks.length : 0,
          ...userStats,
        };

        const insights = await aiService.analyzeProductivity(
          tasks,
          stats,
          new Date()
        );

        setAIState((prev) => ({
          ...prev,
          insights,
          isProcessing: false,
        }));

        return insights;
      } catch (error) {
        console.error("Failed to regenerate insights:", error);
        setAIState((prev) => ({ ...prev, isProcessing: false }));
        return [];
      }
    },
    [isAIAvailable]
  );

  // Get enhancement for specific task
  const getTaskEnhancement = useCallback(
    (taskTitle: string, type: string) => {
      return aiState.taskEnhancements.get(`${type}-${taskTitle}`);
    },
    [aiState.taskEnhancements]
  );

  return {
    // State
    insights: aiState.insights,
    isProcessing: aiState.isProcessing,
    settings: aiState.settings,
    isAIAvailable: isAIAvailable(),

    // Methods
    categorizeTask,
    estimateTaskTime,
    enhanceTaskDescription,
    generateTaskSuggestions,
    analyzeProductivity,
    calculateCompletionProbability,
    updateSettings,
    clearInsights,
    dismissInsight,
    regenerateInsights,
    getTaskEnhancement,
  };
}
