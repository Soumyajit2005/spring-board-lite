"use client";

import React, { useState, useEffect } from "react";
import {
  TestTube,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  BarChart3,
  Zap,
  FileCode,
  AlertTriangle,
  RefreshCw,
  Eye,
  Download,
} from "lucide-react";
import { Task } from "@/lib/types";

export interface TestSuite {
  id: string;
  name: string;
  type: "unit" | "integration" | "e2e" | "visual" | "api" | "performance";
  framework: string;
  status: "idle" | "running" | "passed" | "failed" | "skipped";
  tests: TestCase[];
  coverage: number;
  duration: number;
  createdAt: Date;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  status: "passed" | "failed" | "skipped" | "running";
  duration: number;
  error?: string;
  stackTrace?: string;
  assertions: number;
  file: string;
  line: number;
}

export interface TestReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    coverage: number;
    duration: number;
  };
  suites: TestSuite[];
  trends: {
    passRate: number[];
    coverageHistory: number[];
    performanceHistory: number[];
  };
  recommendations: TestRecommendation[];
}

export interface TestRecommendation {
  type: "coverage" | "performance" | "flaky" | "redundant" | "missing";
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  file?: string;
  suggestedAction: string;
}

export class AutomatedTestingAssistant {
  static generateTestSuite(task: Task): TestSuite {
    const testTypes: TestSuite["type"][] = ["unit", "integration", "e2e"];
    const frameworks: Record<string, string> = {
      unit: "Jest + React Testing Library",
      integration: "Jest + Supertest",
      e2e: "Playwright",
      visual: "Storybook + Chromatic",
      api: "Postman + Newman",
      performance: "Lighthouse + k6",
    };

    const type = testTypes[Math.floor(Math.random() * testTypes.length)];

    return {
      id: "suite-" + Math.random().toString(36).substr(2, 9),
      name: `${task.title} - ${type.toUpperCase()} Tests`,
      type,
      framework: frameworks[type],
      status: "idle",
      tests: this.generateTestCases(task, type),
      coverage: 0,
      duration: 0,
      createdAt: new Date(),
    };
  }

  private static generateTestCases(
    task: Task,
    type: TestSuite["type"]
  ): TestCase[] {
    const cases: TestCase[] = [];

    // Generate test cases based on task type and complexity
    const complexity =
      task.scheduling?.developerContext?.complexity || "moderate";
    const numTests =
      complexity === "simple" ? 3 : complexity === "moderate" ? 5 : 8;

    const testTemplates: Record<string, string[]> = {
      unit: [
        "should render without crashing",
        "should handle user interactions correctly",
        "should validate input properly",
        "should call callback functions",
        "should handle edge cases",
        "should display correct data",
        "should handle loading states",
        "should handle error states",
      ],
      integration: [
        "should integrate with API successfully",
        "should handle authentication flow",
        "should persist data correctly",
        "should handle concurrent operations",
        "should validate data consistency",
        "should handle transaction rollbacks",
        "should integrate with third-party services",
        "should handle rate limiting",
      ],
      e2e: [
        "should complete user journey successfully",
        "should navigate between pages",
        "should submit forms correctly",
        "should handle user authentication",
        "should display notifications",
        "should handle offline scenarios",
        "should work across different browsers",
        "should be accessible to screen readers",
      ],
      visual: [
        "should render components correctly",
        "should handle responsive breakpoints",
        "should maintain visual consistency",
      ],
      api: [
        "should handle API responses correctly",
        "should validate request parameters",
        "should handle rate limiting",
      ],
      performance: [
        "should load within acceptable time limits",
        "should handle large datasets efficiently",
        "should optimize resource usage",
      ],
    };

    const templates = testTemplates[type] || testTemplates.unit;

    for (let i = 0; i < Math.min(numTests, templates.length); i++) {
      cases.push({
        id: "test-" + Math.random().toString(36).substr(2, 9),
        name: templates[i],
        description: `Test case for ${task.title}: ${templates[i]}`,
        status: "skipped",
        duration: 0,
        assertions: Math.floor(Math.random() * 5) + 1,
        file: `tests/${task.title.toLowerCase().replace(/\s+/g, "-")}.test.tsx`,
        line: (i + 1) * 10,
      });
    }

    return cases;
  }

  static async runTestSuite(suite: TestSuite): Promise<TestSuite> {
    // Simulate test execution
    const updatedTests = await Promise.all(
      suite.tests.map(async (test, index) => {
        // Simulate test execution delay
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 2000 + 500)
        );

        const shouldPass = Math.random() > 0.2; // 80% pass rate
        const duration = Math.floor(Math.random() * 1000) + 100;

        return {
          ...test,
          status: shouldPass ? ("passed" as const) : ("failed" as const),
          duration,
          error: shouldPass
            ? undefined
            : `Assertion failed: Expected true but got false`,
          stackTrace: shouldPass
            ? undefined
            : `Error\n    at test${index + 1} (${test.file}:${test.line})`,
        };
      })
    );

    const failed = updatedTests.filter((t) => t.status === "failed").length;
    const totalDuration = updatedTests.reduce(
      (sum, test) => sum + test.duration,
      0
    );
    const coverage = Math.floor(Math.random() * 30) + 70; // 70-100% coverage

    return {
      ...suite,
      tests: updatedTests,
      status: failed > 0 ? "failed" : "passed",
      coverage,
      duration: totalDuration,
    };
  }

  static generateTestReport(suites: TestSuite[]): TestReport {
    const allTests = suites.flatMap((suite) => suite.tests);
    const total = allTests.length;
    const passed = allTests.filter((t) => t.status === "passed").length;
    const failed = allTests.filter((t) => t.status === "failed").length;
    const skipped = allTests.filter((t) => t.status === "skipped").length;

    const totalDuration = suites.reduce(
      (sum, suite) => sum + suite.duration,
      0
    );
    const averageCoverage =
      suites.length > 0
        ? suites.reduce((sum, suite) => sum + suite.coverage, 0) / suites.length
        : 0;

    return {
      summary: {
        total,
        passed,
        failed,
        skipped,
        coverage: Math.round(averageCoverage),
        duration: totalDuration,
      },
      suites,
      trends: {
        passRate: this.generateTrendData(),
        coverageHistory: this.generateTrendData(),
        performanceHistory: this.generateTrendData(),
      },
      recommendations: this.generateRecommendations(suites),
    };
  }

  private static generateTrendData(): number[] {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 80);
  }

  private static generateRecommendations(
    suites: TestSuite[]
  ): TestRecommendation[] {
    const recommendations: TestRecommendation[] = [];

    // Check for low coverage
    const lowCoverageSuites = suites.filter((suite) => suite.coverage < 80);
    if (lowCoverageSuites.length > 0) {
      recommendations.push({
        type: "coverage",
        priority: "high",
        title: "Improve Test Coverage",
        description: `${lowCoverageSuites.length} test suites have coverage below 80%`,
        suggestedAction: "Add more unit tests for uncovered code paths",
      });
    }

    // Check for slow tests
    const slowSuites = suites.filter((suite) => suite.duration > 5000);
    if (slowSuites.length > 0) {
      recommendations.push({
        type: "performance",
        priority: "medium",
        title: "Optimize Slow Tests",
        description: `${slowSuites.length} test suites are taking longer than 5 seconds`,
        suggestedAction:
          "Consider mocking external dependencies or breaking down large tests",
      });
    }

    // Check for missing test types
    const hasE2E = suites.some((suite) => suite.type === "e2e");
    if (!hasE2E) {
      recommendations.push({
        type: "missing",
        priority: "medium",
        title: "Add End-to-End Tests",
        description: "No E2E tests found in the current test suite",
        suggestedAction:
          "Add Playwright or Cypress tests for critical user journeys",
      });
    }

    return recommendations;
  }

  static generateTestCode(testCase: TestCase, framework: string): string {
    const templates = {
      "Jest + React Testing Library": `
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from '../Component';

describe('${testCase.name}', () => {
  test('${testCase.description}', () => {
    render(<Component />);
    
    // Add your test assertions here
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    // Example interaction
    fireEvent.click(screen.getByRole('button'));
    
    // Verify the result
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});`,

      "Jest + Supertest": `
import request from 'supertest';
import { app } from '../app';

describe('${testCase.name}', () => {
  test('${testCase.description}', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toEqual(expect.any(Array));
  });
});`,

      Playwright: `
import { test, expect } from '@playwright/test';

test('${testCase.description}', async ({ page }) => {
  await page.goto('/');
  
  // Add your test steps here
  await page.click('button[data-testid="submit"]');
  
  // Verify the result
  await expect(page.locator('.success-message')).toBeVisible();
});`,
    };

    return (
      templates[framework as keyof typeof templates] ||
      templates["Jest + React Testing Library"]
    );
  }
}

// Test Dashboard Component
export function TestingDashboard({ tasks }: { tasks: Task[] }) {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [report, setReport] = useState<TestReport | null>(null);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "suites" | "reports" | "generate"
  >("overview");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Initialize with some test suites
    const initialSuites = tasks
      .slice(0, 3)
      .map((task) => AutomatedTestingAssistant.generateTestSuite(task));
    setTestSuites(initialSuites);
    setReport(AutomatedTestingAssistant.generateTestReport(initialSuites));
  }, [tasks]);

  const runAllTests = async () => {
    setIsRunning(true);
    const updatedSuites: TestSuite[] = [];

    for (const suite of testSuites) {
      const updatedSuite = await AutomatedTestingAssistant.runTestSuite(suite);
      updatedSuites.push(updatedSuite);
      setTestSuites([
        ...updatedSuites,
        ...testSuites.slice(updatedSuites.length),
      ]);
    }

    setTestSuites(updatedSuites);
    setReport(AutomatedTestingAssistant.generateTestReport(updatedSuites));
    setIsRunning(false);
  };

  const generateTestForTask = (task: Task) => {
    const newSuite = AutomatedTestingAssistant.generateTestSuite(task);
    const updatedSuites = [...testSuites, newSuite];
    setTestSuites(updatedSuites);
    setReport(AutomatedTestingAssistant.generateTestReport(updatedSuites));
  };

  const getStatusIcon = (status: TestSuite["status"] | TestCase["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "running":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "running":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Automated Testing
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            {isRunning ? "Running..." : "Run All"}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { key: "overview", label: "Overview", icon: BarChart3 },
          { key: "suites", label: "Test Suites", icon: TestTube },
          { key: "reports", label: "Reports", icon: FileCode },
          { key: "generate", label: "Generate", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && report && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TestTube className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  Total
                </span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {report.summary.total}
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-800 dark:text-green-200">
                  Passed
                </span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {report.summary.passed}
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-red-800 dark:text-red-200">
                  Failed
                </span>
              </div>
              <div className="text-lg font-bold text-red-600">
                {report.summary.failed}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                  Coverage
                </span>
              </div>
              <div className="text-lg font-bold text-purple-600">
                {report.summary.coverage}%
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-800 dark:text-orange-200">
                  Duration
                </span>
              </div>
              <div className="text-lg font-bold text-orange-600">
                {Math.round(report.summary.duration / 1000)}s
              </div>
            </div>
          </div>

          {/* Test Suites Overview */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Test Suites
            </h4>
            <div className="space-y-2">
              {testSuites.map((suite) => (
                <div
                  key={suite.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer"
                  onClick={() => setSelectedSuite(suite)}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(suite.status)}
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {suite.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {suite.framework} • {suite.tests.length} tests
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        suite.status
                      )}`}
                    >
                      {suite.coverage}% coverage
                    </span>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200/50 dark:border-yellow-800/50">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                Recommendations
              </h4>
              <div className="space-y-2">
                {report.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <div className="font-medium">{rec.title}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {rec.suggestedAction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generate Tests Tab */}
      {activeTab === "generate" && (
        <div className="space-y-4">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Generate Tests from Tasks
            </h4>
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {task.description}
                    </div>
                  </div>
                  <button
                    onClick={() => generateTestForTask(task)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    Generate Tests
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Suite Details Modal */}
      {selectedSuite && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedSuite(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {selectedSuite.name}
                </h3>
                <button
                  onClick={() => setSelectedSuite(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {selectedSuite.framework} • {selectedSuite.coverage}% coverage
              </div>
            </div>

            <div className="p-4 space-y-3">
              {selectedSuite.tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(test.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {test.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {test.file}:{test.line}
                    </div>
                    {test.error && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {test.error}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{test.duration}ms</div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  const code = AutomatedTestingAssistant.generateTestCode(
                    selectedSuite.tests[0],
                    selectedSuite.framework
                  );
                  navigator.clipboard.writeText(code);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Copy Test Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
