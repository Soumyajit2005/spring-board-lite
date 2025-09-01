"use client";

import React, { useState, useEffect } from "react";
import {
  Code,
  FileText,
  GitBranch,
  Database,
  Server,
  Smartphone,
  Bug,
  TestTube,
} from "lucide-react";
import { Task } from "@/lib/types";

export interface CodeContextFeatures {
  // Feature 1: Context-Aware Task Classification
  contextAnalyzer: {
    suggestTaskType: (title: string, description: string) => string;
    extractTechStack: (content: string) => string[];
    estimateComplexity: (task: Task) => "simple" | "moderate" | "complex";
  };

  // Feature 2: Code Pattern Recognition
  patternRecognition: {
    detectApiEndpoints: (description: string) => string[];
    identifyDatabaseOperations: (description: string) => string[];
    findUiComponents: (description: string) => string[];
  };

  // Feature 3: Dependency Chain Analysis
  dependencyAnalysis: {
    suggestDependentTasks: (task: Task, allTasks: Task[]) => string[];
    identifyBlockingTasks: (task: Task, allTasks: Task[]) => string[];
  };
}

export class CodeContextAnalyzer implements CodeContextFeatures {
  contextAnalyzer = {
    suggestTaskType: (title: string, description: string): string => {
      const content = `${title} ${description}`.toLowerCase();

      const patterns = {
        coding: [
          "implement",
          "create",
          "build",
          "develop",
          "add feature",
          "new component",
        ],
        debugging: [
          "fix",
          "bug",
          "error",
          "issue",
          "broken",
          "not working",
          "crash",
        ],
        testing: [
          "test",
          "spec",
          "unit test",
          "integration test",
          "e2e",
          "coverage",
        ],
        documentation: [
          "document",
          "readme",
          "docs",
          "comment",
          "guide",
          "manual",
        ],
        research: [
          "investigate",
          "research",
          "explore",
          "analyze",
          "study",
          "evaluate",
        ],
        review: [
          "review",
          "refactor",
          "optimize",
          "improve",
          "clean up",
          "code review",
        ],
      };

      for (const [type, keywords] of Object.entries(patterns)) {
        if (keywords.some((keyword) => content.includes(keyword))) {
          return type;
        }
      }
      return "coding"; // default
    },

    extractTechStack: (content: string): string[] => {
      const technologies = [
        "react",
        "vue",
        "angular",
        "nodejs",
        "express",
        "nextjs",
        "typescript",
        "javascript",
        "python",
        "java",
        "csharp",
        "go",
        "rust",
        "php",
        "mysql",
        "postgresql",
        "mongodb",
        "redis",
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "gcp",
        "firebase",
        "graphql",
        "rest",
        "api",
        "css",
        "scss",
        "tailwind",
        "bootstrap",
        "material-ui",
        "chakra",
      ];

      const found: string[] = [];
      const lowerContent = content.toLowerCase();

      technologies.forEach((tech) => {
        if (lowerContent.includes(tech)) {
          found.push(tech);
        }
      });

      return found;
    },

    estimateComplexity: (task: Task): "simple" | "moderate" | "complex" => {
      const content = `${task.title} ${task.description}`.toLowerCase();

      const complexityIndicators = {
        complex: [
          "architecture",
          "system design",
          "integration",
          "migration",
          "refactor",
          "performance",
          "security",
          "scalability",
        ],
        moderate: [
          "feature",
          "component",
          "api",
          "database",
          "authentication",
          "validation",
          "testing",
        ],
        simple: [
          "fix",
          "update",
          "style",
          "text",
          "button",
          "link",
          "color",
          "font",
        ],
      };

      for (const [level, indicators] of Object.entries(complexityIndicators)) {
        if (indicators.some((indicator) => content.includes(indicator))) {
          return level as any;
        }
      }

      return "moderate"; // default
    },
  };

  patternRecognition = {
    detectApiEndpoints: (description: string): string[] => {
      const apiPatterns = [
        /\b(GET|POST|PUT|DELETE|PATCH)\s+\/[^\s]+/gi,
        /\/api\/[^\s]+/gi,
        /endpoint[:\s]+[^\s]+/gi,
      ];

      const endpoints: string[] = [];
      apiPatterns.forEach((pattern) => {
        const matches = description.match(pattern);
        if (matches) {
          endpoints.push(...matches);
        }
      });

      return [...new Set(endpoints)]; // remove duplicates
    },

    identifyDatabaseOperations: (description: string): string[] => {
      const dbPatterns = [
        /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/gi,
        /\b(users|products|orders|categories|comments|posts)(?:\s+table)?\b/gi,
        /\b(query|schema|migration|model)\b/gi,
      ];

      const operations: string[] = [];
      dbPatterns.forEach((pattern) => {
        const matches = description.match(pattern);
        if (matches) {
          operations.push(...matches);
        }
      });

      return [...new Set(operations.map((op) => op.toLowerCase()))];
    },

    findUiComponents: (description: string): string[] => {
      const uiPatterns = [
        /\b(button|modal|dialog|form|input|dropdown|menu|navbar|sidebar|header|footer)\b/gi,
        /\b(component|widget|card|panel|tab|accordion|slider|carousel)\b/gi,
        /\b(page|view|screen|layout|template)\b/gi,
      ];

      const components: string[] = [];
      uiPatterns.forEach((pattern) => {
        const matches = description.match(pattern);
        if (matches) {
          components.push(...matches);
        }
      });

      return [...new Set(components.map((comp) => comp.toLowerCase()))];
    },
  };

  dependencyAnalysis = {
    suggestDependentTasks: (task: Task, allTasks: Task[]): string[] => {
      const taskContent = `${task.title} ${task.description}`.toLowerCase();
      const dependencies: string[] = [];

      allTasks.forEach((otherTask) => {
        if (otherTask.id === task.id) return;

        const otherContent =
          `${otherTask.title} ${otherTask.description}`.toLowerCase();

        // Check for common patterns that suggest dependency
        if (this.hasTaskDependency(taskContent, otherContent)) {
          dependencies.push(otherTask.id);
        }
      });

      return dependencies;
    },

    identifyBlockingTasks: (task: Task, allTasks: Task[]): string[] => {
      const blocking: string[] = [];
      const taskContent = `${task.title} ${task.description}`.toLowerCase();

      allTasks.forEach((otherTask) => {
        if (otherTask.id === task.id || otherTask.status === "done") return;

        const otherContent =
          `${otherTask.title} ${otherTask.description}`.toLowerCase();

        // Check if other task might block this one
        if (this.isBlockingTask(otherContent, taskContent)) {
          blocking.push(otherTask.id);
        }
      });

      return blocking;
    },
  };

  private hasTaskDependency(
    taskContent: string,
    otherContent: string
  ): boolean {
    // Simple heuristics for dependency detection
    const dependencyPatterns = [
      // Database/API dependencies
      (task: string, other: string) =>
        task.includes("frontend") && other.includes("api"),
      (task: string, other: string) =>
        task.includes("api") && other.includes("database"),
      (task: string, other: string) =>
        task.includes("ui") && other.includes("component"),
      // Testing dependencies
      (task: string, other: string) =>
        task.includes("test") && other.includes("implement"),
    ];

    return dependencyPatterns.some((pattern) =>
      pattern(taskContent, otherContent)
    );
  }

  private isBlockingTask(otherContent: string, taskContent: string): boolean {
    // Check if other task might block current task
    const blockingPatterns = [
      "setup",
      "configuration",
      "architecture",
      "foundation",
      "database",
      "schema",
      "migration",
      "authentication",
    ];

    return blockingPatterns.some(
      (pattern) =>
        otherContent.includes(pattern) && !taskContent.includes(pattern)
    );
  }
}

// Smart Code Insights Component
export function CodeInsightsPanel({
  tasks,
  onTaskUpdate,
}: {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}) {
  const [analyzer] = useState(new CodeContextAnalyzer());
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    const newInsights = generateCodeInsights(tasks, analyzer);
    setInsights(newInsights);
  }, [tasks, analyzer]);

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5 text-green-600 dark:text-green-400" />
        <h3 className="font-medium text-gray-900 dark:text-white">
          Code Insights
        </h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              {getInsightIcon(insight.type)}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {insight.title}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {insight.description}
            </p>
            {insight.action && (
              <button
                onClick={() => insight.action(onTaskUpdate)}
                className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                {insight.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getInsightIcon(type: string) {
  const icons = {
    api: <Server className="w-4 h-4 text-blue-500" />,
    database: <Database className="w-4 h-4 text-purple-500" />,
    ui: <Smartphone className="w-4 h-4 text-green-500" />,
    bug: <Bug className="w-4 h-4 text-red-500" />,
    test: <TestTube className="w-4 h-4 text-yellow-500" />,
    docs: <FileText className="w-4 h-4 text-gray-500" />,
    git: <GitBranch className="w-4 h-4 text-orange-500" />,
  };
  return (
    icons[type as keyof typeof icons] || (
      <Code className="w-4 h-4 text-gray-500" />
    )
  );
}

function generateCodeInsights(
  tasks: Task[],
  analyzer: CodeContextAnalyzer
): any[] {
  const insights: any[] = [];

  // Analyze task patterns
  const unclassifiedTasks = tasks.filter(
    (task) => !task.scheduling?.developerContext?.taskType
  );

  if (unclassifiedTasks.length > 0) {
    insights.push({
      type: "classification",
      title: `${unclassifiedTasks.length} tasks need classification`,
      description: "Auto-classify tasks based on content analysis",
      actionLabel: "Auto-classify",
      action: (onTaskUpdate: Function) => {
        unclassifiedTasks.forEach((task) => {
          const suggestedType = analyzer.contextAnalyzer.suggestTaskType(
            task.title,
            task.description
          );
          const techStack = analyzer.contextAnalyzer.extractTechStack(
            `${task.title} ${task.description}`
          );
          const complexity = analyzer.contextAnalyzer.estimateComplexity(task);

          onTaskUpdate(task.id, {
            scheduling: {
              ...task.scheduling,
              developerContext: {
                ...task.scheduling?.developerContext,
                taskType: suggestedType as any,
                techStack,
                complexity,
              },
            },
          });
        });
      },
    });
  }

  // Check for API patterns
  const apiTasks = tasks.filter((task) => {
    const endpoints = analyzer.patternRecognition.detectApiEndpoints(
      task.description
    );
    return endpoints.length > 0;
  });

  if (apiTasks.length > 0) {
    insights.push({
      type: "api",
      title: `${apiTasks.length} API-related tasks detected`,
      description:
        "Consider grouping API tasks and ensuring proper documentation",
      actionLabel: "Group APIs",
    });
  }

  // Database operation insights
  const dbTasks = tasks.filter((task) => {
    const operations = analyzer.patternRecognition.identifyDatabaseOperations(
      task.description
    );
    return operations.length > 0;
  });

  if (dbTasks.length > 0) {
    insights.push({
      type: "database",
      title: `${dbTasks.length} database tasks found`,
      description: "Schedule database tasks during low-traffic hours",
      actionLabel: "Schedule Off-peak",
    });
  }

  return insights;
}
