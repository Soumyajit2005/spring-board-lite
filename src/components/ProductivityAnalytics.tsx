"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  Target,
  Coffee,
  Moon,
  Calendar,
} from "lucide-react";
import { Task, DeveloperTaskType } from "@/lib/types";

export interface ProductivityMetrics {
  dailyStats: {
    tasksCompleted: number;
    averageTaskTime: number;
    peakProductivityHour: number;
    energyPattern: "morning" | "afternoon" | "evening";
  };
  weeklyTrends: {
    mostProductiveDay: string;
    averageTasksPerDay: number;
    streakLength: number;
    burnoutRisk: "low" | "medium" | "high";
  };
  taskTypeEfficiency: Record<
    DeveloperTaskType,
    {
      averageTime: number;
      successRate: number;
      difficulty: number;
    }
  >;
}

export class ProductivityAnalyzer {
  static analyzeProductivity(tasks: Task[]): ProductivityMetrics {
    const completedTasks = tasks.filter((task) => task.status === "done");
    const now = new Date();

    return {
      dailyStats: this.calculateDailyStats(completedTasks, now),
      weeklyTrends: this.calculateWeeklyTrends(completedTasks, now),
      taskTypeEfficiency: this.calculateTaskTypeEfficiency(completedTasks),
    };
  }

  private static calculateDailyStats(tasks: Task[], now: Date) {
    const today = now.toDateString();
    const todayTasks = tasks.filter(
      (task) => new Date(task.updatedAt).toDateString() === today
    );

    // Simulate productivity patterns
    const hourlyCompletions = Array(24).fill(0);
    todayTasks.forEach((task) => {
      const hour = new Date(task.updatedAt).getHours();
      hourlyCompletions[hour]++;
    });

    const peakHour = hourlyCompletions.indexOf(Math.max(...hourlyCompletions));

    return {
      tasksCompleted: todayTasks.length,
      averageTaskTime: this.calculateAverageTaskTime(todayTasks),
      peakProductivityHour: peakHour,
      energyPattern: this.determineEnergyPattern(peakHour),
    };
  }

  private static calculateWeeklyTrends(tasks: Task[], now: Date) {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekTasks = tasks.filter(
      (task) => new Date(task.updatedAt) >= weekAgo
    );

    const dailyCounts = Array(7).fill(0);
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    weekTasks.forEach((task) => {
      const dayIndex = new Date(task.updatedAt).getDay();
      dailyCounts[dayIndex]++;
    });

    const mostProductiveDayIndex = dailyCounts.indexOf(
      Math.max(...dailyCounts)
    );
    const averageTasksPerDay = weekTasks.length / 7;

    return {
      mostProductiveDay: dayNames[mostProductiveDayIndex],
      averageTasksPerDay: Math.round(averageTasksPerDay * 10) / 10,
      streakLength: this.calculateStreak(tasks),
      burnoutRisk: this.assessBurnoutRisk(weekTasks, averageTasksPerDay),
    };
  }

  private static calculateTaskTypeEfficiency(tasks: Task[]) {
    const taskTypes: DeveloperTaskType[] = [
      "coding",
      "debugging",
      "research",
      "documentation",
      "testing",
      "review",
      "meeting",
      "planning",
    ];
    const efficiency: any = {};

    taskTypes.forEach((type) => {
      const typeTasks = tasks.filter(
        (task) => task.scheduling?.developerContext?.taskType === type
      );

      if (typeTasks.length > 0) {
        efficiency[type] = {
          averageTime: this.calculateAverageTaskTime(typeTasks),
          successRate: 0.85 + Math.random() * 0.15, // Simulate success rate
          difficulty: this.calculateDifficulty(typeTasks),
        };
      } else {
        efficiency[type] = {
          averageTime: 0,
          successRate: 0,
          difficulty: 0,
        };
      }
    });

    return efficiency;
  }

  private static calculateAverageTaskTime(tasks: Task[]): number {
    if (tasks.length === 0) return 0;

    const totalTime = tasks.reduce((sum, task) => {
      return sum + (task.scheduling?.estimatedDuration || 60);
    }, 0);

    return Math.round(totalTime / tasks.length);
  }

  private static determineEnergyPattern(
    peakHour: number
  ): "morning" | "afternoon" | "evening" {
    if (peakHour < 12) return "morning";
    if (peakHour < 17) return "afternoon";
    return "evening";
  }

  private static calculateStreak(tasks: Task[]): number {
    // Simplified streak calculation
    const completedTasks = tasks.filter((task) => task.status === "done");
    const recentTasks = completedTasks.slice(-7); // Last 7 days
    return Math.min(recentTasks.length, 7);
  }

  private static assessBurnoutRisk(
    _weekTasks: Task[],
    averageTasksPerDay: number
  ): "low" | "medium" | "high" {
    if (averageTasksPerDay > 8) return "high";
    if (averageTasksPerDay > 5) return "medium";
    return "low";
  }

  private static calculateDifficulty(tasks: Task[]): number {
    const complexityScores = {
      simple: 1,
      moderate: 2,
      complex: 3,
    };

    const totalComplexity = tasks.reduce((sum, task) => {
      const complexity =
        task.scheduling?.developerContext?.complexity || "moderate";
      return sum + complexityScores[complexity];
    }, 0);

    return totalComplexity / Math.max(tasks.length, 1);
  }
}

// Productivity Dashboard Component
export function ProductivityDashboard({ tasks }: { tasks: Task[] }) {
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("week");

  useEffect(() => {
    const newMetrics = ProductivityAnalyzer.analyzeProductivity(tasks);
    setMetrics(newMetrics);
  }, [tasks]);

  if (!metrics) {
    return <div className="animate-pulse">Loading analytics...</div>;
  }

  const getEnergyIcon = (pattern: string) => {
    switch (pattern) {
      case "morning":
        return <Coffee className="w-4 h-4 text-orange-500" />;
      case "afternoon":
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case "evening":
        return <Moon className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBurnoutColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-500 bg-red-50 dark:bg-red-900/20";
      case "medium":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      default:
        return "text-green-500 bg-green-50 dark:bg-green-900/20";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Productivity Analytics
          </h3>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tasks Completed */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
              Completed
            </span>
          </div>
          <div className="text-lg font-bold text-blue-600">
            {metrics.dailyStats.tasksCompleted}
          </div>
          <div className="text-xs text-blue-500">tasks today</div>
        </div>

        {/* Average Task Time */}
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-800 dark:text-green-200">
              Avg Time
            </span>
          </div>
          <div className="text-lg font-bold text-green-600">
            {metrics.dailyStats.averageTaskTime}m
          </div>
          <div className="text-xs text-green-500">per task</div>
        </div>

        {/* Peak Hour */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            {getEnergyIcon(metrics.dailyStats.energyPattern)}
            <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
              Peak Time
            </span>
          </div>
          <div className="text-lg font-bold text-purple-600">
            {metrics.dailyStats.peakProductivityHour}:00
          </div>
          <div className="text-xs text-purple-500">
            {metrics.dailyStats.energyPattern} person
          </div>
        </div>

        {/* Streak */}
        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-800 dark:text-orange-200">
              Streak
            </span>
          </div>
          <div className="text-lg font-bold text-orange-600">
            {metrics.weeklyTrends.streakLength}
          </div>
          <div className="text-xs text-orange-500">days active</div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Weekly Trends
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Most Productive Day
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {metrics.weeklyTrends.mostProductiveDay}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Daily Average
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {metrics.weeklyTrends.averageTasksPerDay} tasks
            </div>
          </div>
        </div>

        {/* Burnout Risk Indicator */}
        <div className="mt-3 p-2 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Burnout Risk
          </div>
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getBurnoutColor(
              metrics.weeklyTrends.burnoutRisk
            )}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                metrics.weeklyTrends.burnoutRisk === "high"
                  ? "bg-red-500"
                  : metrics.weeklyTrends.burnoutRisk === "medium"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            />
            {metrics.weeklyTrends.burnoutRisk} risk
          </div>
        </div>
      </div>

      {/* Task Type Efficiency */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Task Type Efficiency
        </h4>

        <div className="space-y-2">
          {Object.entries(metrics.taskTypeEfficiency).map(([type, stats]) => {
            if (stats.averageTime === 0) return null;

            return (
              <div
                key={type}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {stats.averageTime}m avg
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">
                    {Math.round(stats.successRate * 100)}% success
                  </div>
                  <div className="w-12 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${stats.successRate * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-800/50">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-600" />
          Smart Recommendations
        </h4>

        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {generateSmartRecommendations(metrics).map(
            (recommendation, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span>{recommendation}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function generateSmartRecommendations(metrics: ProductivityMetrics): string[] {
  const recommendations: string[] = [];

  // Energy pattern recommendations
  if (metrics.dailyStats.energyPattern === "morning") {
    recommendations.push(
      "Schedule complex tasks before 12 PM when you're most productive"
    );
  } else if (metrics.dailyStats.energyPattern === "evening") {
    recommendations.push("Consider shifting important work to evening hours");
  }

  // Burnout prevention
  if (metrics.weeklyTrends.burnoutRisk === "high") {
    recommendations.push(
      "Take regular breaks and consider reducing daily task load"
    );
  } else if (metrics.weeklyTrends.burnoutRisk === "medium") {
    recommendations.push("Schedule lighter tasks on your least productive day");
  }

  // Task efficiency
  const inefficientTypes = Object.entries(metrics.taskTypeEfficiency)
    .filter(([_, stats]) => stats.successRate < 0.7)
    .map(([type]) => type);

  if (inefficientTypes.length > 0) {
    recommendations.push(
      `Focus on improving efficiency in: ${inefficientTypes.join(", ")}`
    );
  }

  // Streak motivation
  if (metrics.weeklyTrends.streakLength < 3) {
    recommendations.push(
      "Try to complete at least one task daily to build momentum"
    );
  }

  return recommendations;
}
