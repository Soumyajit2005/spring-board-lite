"use client";

import React, { useState } from "react";
import {
  GitBranch,
  Eye,
  Code,
  Shield,
  TrendingUp,
  Lightbulb,
  Search,
} from "lucide-react";
import { Task } from "@/lib/types";

export interface CodeReviewData {
  pullRequest: {
    id: string;
    title: string;
    author: string;
    branch: string;
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
    status: "draft" | "ready" | "approved" | "merged";
    createdAt: Date;
  };
  securityIssues: SecurityIssue[];
  performanceIssues: PerformanceIssue[];
  codeQualityIssues: QualityIssue[];
  suggestions: ReviewSuggestion[];
  complexity: ComplexityAnalysis;
}

export interface SecurityIssue {
  type: "sql-injection" | "xss" | "auth" | "data-exposure" | "dependency";
  severity: "low" | "medium" | "high" | "critical";
  file: string;
  line: number;
  message: string;
  suggestion: string;
}

export interface PerformanceIssue {
  type:
    | "memory-leak"
    | "inefficient-query"
    | "large-bundle"
    | "blocking-operation";
  impact: "low" | "medium" | "high";
  file: string;
  line: number;
  message: string;
  estimatedSavings: string;
}

export interface QualityIssue {
  type: "complexity" | "duplication" | "naming" | "architecture" | "testing";
  severity: "info" | "warning" | "error";
  file: string;
  line: number;
  message: string;
  autoFixable: boolean;
}

export interface ReviewSuggestion {
  category:
    | "refactor"
    | "optimize"
    | "modernize"
    | "accessibility"
    | "documentation";
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  effort: "minutes" | "hours" | "days";
}

export interface ComplexityAnalysis {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
  testCoverage: number;
}

export class SmartCodeReviewAssistant {
  static async analyzeCode(filePaths: string[]): Promise<CodeReviewData> {
    // Simulate AI-powered code analysis
    const mockPR = {
      id: "PR-" + Math.floor(Math.random() * 1000),
      title: "Add smart scheduling features",
      author: "developer",
      branch: "feature/smart-scheduler",
      filesChanged: filePaths.length,
      linesAdded: Math.floor(Math.random() * 500) + 100,
      linesDeleted: Math.floor(Math.random() * 100) + 20,
      status: "ready" as const,
      createdAt: new Date(),
    };

    return {
      pullRequest: mockPR,
      securityIssues: this.generateSecurityIssues(filePaths),
      performanceIssues: this.generatePerformanceIssues(filePaths),
      codeQualityIssues: this.generateQualityIssues(filePaths),
      suggestions: this.generateSuggestions(),
      complexity: this.analyzeComplexity(),
    };
  }

  private static generateSecurityIssues(filePaths: string[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Simulate common security issues
    if (
      filePaths.some((path) => path.includes("auth") || path.includes("login"))
    ) {
      issues.push({
        type: "auth",
        severity: "high",
        file: "src/app/login/page.tsx",
        line: 42,
        message: "Password field not properly validated",
        suggestion: "Add password strength validation and rate limiting",
      });
    }

    if (filePaths.some((path) => path.includes("api") || path.includes("db"))) {
      issues.push({
        type: "sql-injection",
        severity: "medium",
        file: "src/lib/api.ts",
        line: 78,
        message: "Direct string concatenation in database query",
        suggestion: "Use parameterized queries or ORM methods",
      });
    }

    return issues;
  }

  private static generatePerformanceIssues(
    filePaths: string[]
  ): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];

    // Simulate performance analysis
    if (filePaths.some((path) => path.includes("components"))) {
      issues.push({
        type: "memory-leak",
        impact: "medium",
        file: "src/components/TaskCard.tsx",
        line: 125,
        message: "useEffect hook missing cleanup function",
        estimatedSavings: "15% memory reduction",
      });
    }

    if (filePaths.some((path) => path.includes("board"))) {
      issues.push({
        type: "inefficient-query",
        impact: "high",
        file: "src/app/board/page.tsx",
        line: 89,
        message: "Multiple unnecessary re-renders on state change",
        estimatedSavings: "200ms faster loading",
      });
    }

    return issues;
  }

  private static generateQualityIssues(filePaths: string[]): QualityIssue[] {
    const issues: QualityIssue[] = [];

    filePaths.forEach((path) => {
      // Simulate code quality checks
      if (Math.random() > 0.7) {
        issues.push({
          type: "complexity",
          severity: "warning",
          file: path,
          line: Math.floor(Math.random() * 100) + 1,
          message: "Function has high cyclomatic complexity",
          autoFixable: false,
        });
      }

      if (Math.random() > 0.8) {
        issues.push({
          type: "naming",
          severity: "info",
          file: path,
          line: Math.floor(Math.random() * 100) + 1,
          message: "Variable name could be more descriptive",
          autoFixable: true,
        });
      }
    });

    return issues;
  }

  private static generateSuggestions(): ReviewSuggestion[] {
    return [
      {
        category: "optimize",
        priority: "high",
        title: "Implement virtual scrolling",
        description:
          "For large task lists, virtual scrolling can improve performance significantly",
        effort: "hours",
      },
      {
        category: "accessibility",
        priority: "medium",
        title: "Add ARIA labels",
        description:
          "Improve screen reader support with proper ARIA attributes",
        effort: "minutes",
      },
      {
        category: "modernize",
        priority: "medium",
        title: "Upgrade to React Server Components",
        description: "Leverage RSC for better performance and SEO",
        effort: "days",
      },
      {
        category: "documentation",
        priority: "low",
        title: "Add JSDoc comments",
        description: "Document complex functions for better maintainability",
        effort: "hours",
      },
    ];
  }

  private static analyzeComplexity(): ComplexityAnalysis {
    return {
      cyclomaticComplexity: Math.floor(Math.random() * 20) + 5,
      cognitiveComplexity: Math.floor(Math.random() * 15) + 3,
      maintainabilityIndex: Math.floor(Math.random() * 40) + 60,
      testCoverage: Math.floor(Math.random() * 30) + 70,
    };
  }

  static generateReviewComment(
    issue: SecurityIssue | PerformanceIssue | QualityIssue
  ): string {
    const templates = {
      security: [
        "🔒 Security concern: This could potentially expose sensitive data.",
        "⚠️ Authentication vulnerability detected. Please implement proper validation.",
        "🛡️ Consider using established security libraries for this functionality.",
      ],
      performance: [
        "⚡ Performance optimization opportunity: This operation could be more efficient.",
        "📊 Memory usage concern: Consider implementing proper cleanup.",
        "🚀 This could benefit from caching or memoization.",
      ],
      quality: [
        "✨ Code quality suggestion: This function could be simplified.",
        "🔧 Refactoring opportunity: Consider breaking this into smaller functions.",
        "📝 Naming convention: This variable/function name could be more descriptive.",
      ],
    };

    const category =
      "severity" in issue &&
      (issue.severity === "high" || issue.severity === "critical")
        ? "security"
        : "impact" in issue
        ? "performance"
        : "quality";

    const template =
      templates[category][
        Math.floor(Math.random() * templates[category].length)
      ];
    const suggestion =
      "suggestion" in issue
        ? issue.suggestion
        : "Consider refactoring this code.";
    return `${template}\n\n${issue.message}\n\n💡 Suggestion: ${suggestion}`;
  }
}

// Smart Code Review Panel Component
export function SmartCodeReviewPanel({ tasks: _tasks }: { tasks: Task[] }) {
  const [reviewData, setReviewData] = useState<CodeReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "security" | "performance" | "quality" | "suggestions"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const runCodeReview = async () => {
    setLoading(true);
    // Simulate analyzing files based on tasks
    const filePaths = [
      "src/components/TaskCard.tsx",
      "src/app/board/page.tsx",
      "src/lib/api.ts",
      "src/hooks/useTasks.ts",
    ];

    const data = await SmartCodeReviewAssistant.analyzeCode(filePaths);
    setReviewData(data);
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "high":
        return "bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400";
      case "medium":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/10 dark:text-yellow-400";
      default:
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400";
    }
  };

  const getComplexityColor = (value: number, max: number) => {
    const ratio = value / max;
    if (ratio > 0.8) return "text-red-500";
    if (ratio > 0.6) return "text-yellow-500";
    return "text-green-500";
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Smart Code Review
          </h3>
        </div>
        <button
          onClick={runCodeReview}
          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
        >
          Analyze Code
        </button>
      </div>

      {!reviewData ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Click "Analyze Code" to start AI-powered code review</p>
        </div>
      ) : (
        <>
          {/* PR Overview */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {reviewData.pullRequest.title}
                </span>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  reviewData.pullRequest.status === "approved"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    : reviewData.pullRequest.status === "ready"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                }`}
              >
                {reviewData.pullRequest.status}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Files Changed</span>
                <div className="font-medium">
                  {reviewData.pullRequest.filesChanged}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Lines Added</span>
                <div className="font-medium text-green-600">
                  +{reviewData.pullRequest.linesAdded}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Lines Deleted</span>
                <div className="font-medium text-red-600">
                  -{reviewData.pullRequest.linesDeleted}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: "overview", label: "Overview", icon: Eye },
              {
                key: "security",
                label: "Security",
                icon: Shield,
                count: reviewData.securityIssues.length,
              },
              {
                key: "performance",
                label: "Performance",
                icon: TrendingUp,
                count: reviewData.performanceIssues.length,
              },
              {
                key: "quality",
                label: "Quality",
                icon: Code,
                count: reviewData.codeQualityIssues.length,
              },
              {
                key: "suggestions",
                label: "Suggestions",
                icon: Lightbulb,
                count: reviewData.suggestions.length,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedTab === tab.key
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                        tab.count > 0
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          {selectedTab !== "overview" && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${selectedTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Tab Content */}
          {selectedTab === "overview" && (
            <div className="space-y-4">
              {/* Complexity Metrics */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Code Complexity Analysis
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Cyclomatic Complexity
                    </div>
                    <div
                      className={`text-lg font-bold ${getComplexityColor(
                        reviewData.complexity.cyclomaticComplexity,
                        25
                      )}`}
                    >
                      {reviewData.complexity.cyclomaticComplexity}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Test Coverage
                    </div>
                    <div
                      className={`text-lg font-bold ${getComplexityColor(
                        100 - reviewData.complexity.testCoverage,
                        100
                      )}`}
                    >
                      {reviewData.complexity.testCoverage}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Maintainability Index
                    </div>
                    <div
                      className={`text-lg font-bold ${getComplexityColor(
                        100 - reviewData.complexity.maintainabilityIndex,
                        100
                      )}`}
                    >
                      {reviewData.complexity.maintainabilityIndex}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Cognitive Complexity
                    </div>
                    <div
                      className={`text-lg font-bold ${getComplexityColor(
                        reviewData.complexity.cognitiveComplexity,
                        20
                      )}`}
                    >
                      {reviewData.complexity.cognitiveComplexity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Issues Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg ${getSeverityColor("high")}`}>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Security</span>
                  </div>
                  <div className="text-lg font-bold">
                    {reviewData.securityIssues.length}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getSeverityColor("medium")}`}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Performance</span>
                  </div>
                  <div className="text-lg font-bold">
                    {reviewData.performanceIssues.length}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getSeverityColor("low")}`}>
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    <span className="font-medium">Quality</span>
                  </div>
                  <div className="text-lg font-bold">
                    {reviewData.codeQualityIssues.length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Issues */}
          {selectedTab === "security" && (
            <div className="space-y-3">
              {reviewData.securityIssues
                .filter(
                  (issue) =>
                    !searchTerm ||
                    issue.message
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((issue, index) => (
                  <div
                    key={index}
                    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-600" />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                            issue.severity
                          )}`}
                        >
                          {issue.severity}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {issue.file}:{issue.line}
                      </div>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white mb-2">
                      {issue.message}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      💡 {issue.suggestion}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Performance Issues */}
          {selectedTab === "performance" && (
            <div className="space-y-3">
              {reviewData.performanceIssues
                .filter(
                  (issue) =>
                    !searchTerm ||
                    issue.message
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((issue, index) => (
                  <div
                    key={index}
                    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-yellow-600" />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                            issue.impact
                          )}`}
                        >
                          {issue.impact} impact
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {issue.file}:{issue.line}
                      </div>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white mb-2">
                      {issue.message}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ⚡ Potential savings: {issue.estimatedSavings}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Quality Issues */}
          {selectedTab === "quality" && (
            <div className="space-y-3">
              {reviewData.codeQualityIssues
                .filter(
                  (issue) =>
                    !searchTerm ||
                    issue.message
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((issue, index) => (
                  <div
                    key={index}
                    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-blue-600" />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                            issue.severity
                          )}`}
                        >
                          {issue.severity}
                        </span>
                        {issue.autoFixable && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            Auto-fixable
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {issue.file}:{issue.line}
                      </div>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {issue.message}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Suggestions */}
          {selectedTab === "suggestions" && (
            <div className="space-y-3">
              {reviewData.suggestions
                .filter(
                  (suggestion) =>
                    !searchTerm ||
                    suggestion.title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                            suggestion.priority
                          )}`}
                        >
                          {suggestion.priority} priority
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                          {suggestion.category}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {suggestion.effort}
                      </div>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {suggestion.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {suggestion.description}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
