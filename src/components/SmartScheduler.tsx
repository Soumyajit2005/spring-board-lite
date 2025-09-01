"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Zap,
  GitBranch,
  Brain,
  Target,
  TrendingUp,
  Code,
} from "lucide-react";
import {
  Task,
  DeveloperProfile,
  ScheduleSlot,
  EnergyLevel,
  DeveloperTaskType,
  ComplexityLevel,
} from "@/lib/types";
import { SmartScheduler } from "@/lib/smart-scheduler";
import { GitIntegrationService } from "@/lib/git-integration";

interface SmartSchedulerPanelProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  className?: string;
}

export function SmartSchedulerPanel({
  tasks,
  onTaskUpdate,
  className = "",
}: SmartSchedulerPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [developerProfile, setDeveloperProfile] = useState<DeveloperProfile>({
    userId: "current-user",
    workingHours: { start: "09:00", end: "17:00" },
    energyPattern: { morning: "high", afternoon: "medium", evening: "low" },
    preferredTaskTypes: ["coding", "debugging"],
    techStack: ["TypeScript", "React", "Node.js"],
    focusBlocks: { duration: 90, breakBetween: 15 },
    gitRepositories: [],
  });

  const scheduler = new SmartScheduler(developerProfile);
  const gitService = GitIntegrationService.getInstance();

  useEffect(() => {
    if (tasks.length > 0) {
      const newSchedule = scheduler.scheduleTasks(tasks);
      setSchedule(newSchedule);
    }
  }, [tasks, developerProfile]);

  const handleScheduleTask = (task: Task) => {
    const estimatedDuration = SmartScheduler.estimateTaskDuration(task);
    const suggestions = SmartScheduler.generateSmartSuggestions(task);

    const scheduling = {
      ...task.scheduling,
      estimatedDuration,
      scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Schedule for next hour
    };

    onTaskUpdate(task.id, { scheduling });
  };

  const getEnergyIcon = (level: EnergyLevel) => {
    switch (level) {
      case "high":
        return "⚡";
      case "medium":
        return "🔋";
      case "low":
        return "🪫";
    }
  };

  const getTaskTypeIcon = (type: DeveloperTaskType) => {
    const icons = {
      coding: "💻",
      debugging: "🐛",
      research: "🔍",
      documentation: "📝",
      testing: "🧪",
      review: "👀",
      meeting: "🤝",
      planning: "📋",
    };
    return icons[type] || "📋";
  };

  const upcomingTasks = schedule
    .filter((slot) => {
      const slotTime = new Date(slot.startTime);
      return slotTime > new Date();
    })
    .slice(0, 5);

  const todaysTasks = schedule.filter((slot) => {
    const slotDate = new Date(slot.startTime);
    const today = new Date();
    return slotDate.toDateString() === today.toDateString();
  });

  return (
    <div
      className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Smart Scheduler
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI-powered task scheduling for developers
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {todaysTasks.length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Today's Tasks
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {Math.round(
              schedule.reduce((sum, slot) => {
                const task = tasks.find((t) => t.id === slot.taskId);
                return sum + (task?.scheduling?.estimatedDuration || 60);
              }, 0) / 60
            )}
            h
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Scheduled
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {Math.round(
              (tasks.filter((t) => t.status === "done").length /
                Math.max(tasks.length, 1)) *
                100
            )}
            %
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Complete
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200/50 dark:border-gray-700/50">
          {/* Upcoming Tasks */}
          <div className="p-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-900 dark:text-white mb-3">
              <Calendar className="w-4 h-4" />
              Upcoming Schedule
            </h4>
            <div className="space-y-2">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((slot) => {
                  const task = tasks.find((t) => t.id === slot.taskId);
                  if (!task) return null;

                  const startTime = new Date(slot.startTime);
                  const endTime = new Date(slot.endTime);

                  return (
                    <div
                      key={slot.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-20">
                        {startTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {getTaskTypeIcon(
                              task.scheduling?.developerContext?.taskType ||
                                "coding"
                            )}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </span>
                          <span className="text-xs">
                            {getEnergyIcon(slot.energyRequired)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(
                            (endTime.getTime() - startTime.getTime()) / 60000
                          )}
                          min
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No scheduled tasks</p>
                  <p className="text-xs">
                    Tasks will appear here once scheduled
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Unscheduled Tasks with Smart Suggestions */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-900 dark:text-white mb-3">
              <Target className="w-4 h-4" />
              Smart Suggestions
            </h4>
            <div className="space-y-3">
              {tasks
                .filter(
                  (task) =>
                    task.status !== "done" && !task.scheduling?.scheduledFor
                )
                .slice(0, 3)
                .map((task) => {
                  const suggestions =
                    SmartScheduler.generateSmartSuggestions(task);
                  return (
                    <div
                      key={task.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {task.title}
                        </span>
                        <button
                          onClick={() => handleScheduleTask(task)}
                          className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                        >
                          Schedule
                        </button>
                      </div>
                      <div className="space-y-1">
                        {suggestions.slice(0, 2).map((suggestion, index) => (
                          <p
                            key={index}
                            className="text-xs text-gray-600 dark:text-gray-400"
                          >
                            {suggestion}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Developer Insights */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-900 dark:text-white mb-3">
              <TrendingUp className="w-4 h-4" />
              Developer Insights
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Peak Hours
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  9AM - 11AM, 2PM - 4PM
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-sm font-medium text-green-800 dark:text-green-200">
                  Focus Time
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  90min blocks + 15min breaks
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Preferred Tasks
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  💻 Coding, 🐛 Debugging
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <div className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Tech Stack
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  TS, React, Node.js
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Task Card with Scheduling Info
export function SchedulingTaskCard({
  task,
  onUpdate,
  className = "",
}: {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  className?: string;
}) {
  const [showScheduling, setShowScheduling] = useState(false);

  const scheduling = task.scheduling || {};
  const context = scheduling.developerContext || {};

  const updateScheduling = (updates: Partial<Task["scheduling"]>) => {
    onUpdate({
      scheduling: {
        ...scheduling,
        ...updates,
      },
    });
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {task.title}
        </h3>
        <button
          onClick={() => setShowScheduling(!showScheduling)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Brain className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {task.description}
        </p>
      )}

      {/* Scheduling Controls */}
      {showScheduling && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 space-y-3">
          {/* Task Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Type
            </label>
            <select
              value={context.taskType || "coding"}
              onChange={(e) =>
                updateScheduling({
                  developerContext: {
                    ...context,
                    taskType: e.target.value as DeveloperTaskType,
                  },
                })
              }
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
            >
              <option value="coding">💻 Coding</option>
              <option value="debugging">🐛 Debugging</option>
              <option value="research">🔍 Research</option>
              <option value="documentation">📝 Documentation</option>
              <option value="testing">🧪 Testing</option>
              <option value="review">👀 Code Review</option>
              <option value="meeting">🤝 Meeting</option>
              <option value="planning">📋 Planning</option>
            </select>
          </div>

          {/* Complexity */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Complexity
            </label>
            <select
              value={context.complexity || "moderate"}
              onChange={(e) =>
                updateScheduling({
                  developerContext: {
                    ...context,
                    complexity: e.target.value as ComplexityLevel,
                  },
                })
              }
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
            >
              <option value="simple">🟢 Simple</option>
              <option value="moderate">🟡 Moderate</option>
              <option value="complex">🔴 Complex</option>
            </select>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Energy Required
            </label>
            <select
              value={scheduling.energyLevel || "medium"}
              onChange={(e) =>
                updateScheduling({
                  energyLevel: e.target.value as EnergyLevel,
                })
              }
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
            >
              <option value="low">🪫 Low Energy</option>
              <option value="medium">🔋 Medium Energy</option>
              <option value="high">⚡ High Energy</option>
            </select>
          </div>

          {/* Estimated Duration */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estimated Duration (minutes)
            </label>
            <input
              type="number"
              value={
                scheduling.estimatedDuration ||
                SmartScheduler.estimateTaskDuration(task)
              }
              onChange={(e) =>
                updateScheduling({
                  estimatedDuration: parseInt(e.target.value) || 60,
                })
              }
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
              min="15"
              step="15"
            />
          </div>

          {/* Focus Time Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={context.focusTime || false}
              onChange={(e) =>
                updateScheduling({
                  developerContext: {
                    ...context,
                    focusTime: e.target.checked,
                  },
                })
              }
              className="rounded"
            />
            <label className="text-xs text-gray-700 dark:text-gray-300">
              Requires deep focus time
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
