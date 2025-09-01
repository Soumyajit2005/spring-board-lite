"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Lightbulb,
  Code,
  Zap,
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Copy,
  Star,
} from "lucide-react";
import { Task } from "@/lib/types";

export interface RefactoringOpportunity {
  id: string;
  type:
    | "extract-method"
    | "remove-duplication"
    | "simplify-condition"
    | "modernize-syntax"
    | "performance"
    | "accessibility";
  severity: "low" | "medium" | "high";
  file: string;
  line: number;
  column: number;
  title: string;
  description: string;
  originalCode: string;
  refactoredCode: string;
  benefits: string[];
  effort: "minutes" | "hours" | "days";
  impact: {
    readability: number;
    performance: number;
    maintainability: number;
  };
}

export interface RefactoringSession {
  id: string;
  name: string;
  createdAt: Date;
  opportunities: RefactoringOpportunity[];
  appliedRefactorings: string[];
  status: "analyzing" | "ready" | "in-progress" | "completed";
}

export class AIRefactoringAssistant {
  static analyzeCodeForRefactoring(filePaths: string[]): RefactoringSession {
    return {
      id: "session-" + Date.now(),
      name: "Smart Refactoring Analysis",
      createdAt: new Date(),
      opportunities: this.generateRefactoringOpportunities(filePaths),
      appliedRefactorings: [],
      status: "ready",
    };
  }

  private static generateRefactoringOpportunities(
    filePaths: string[]
  ): RefactoringOpportunity[] {
    const opportunities: RefactoringOpportunity[] = [];

    filePaths.forEach((file, index) => {
      // Extract Method Opportunity
      opportunities.push({
        id: `refactor-${index}-extract`,
        type: "extract-method",
        severity: "medium",
        file,
        line: 45 + index * 10,
        column: 12,
        title: "Extract Method: Complex calculation logic",
        description:
          "This function contains complex calculation logic that could be extracted into a separate method",
        originalCode: `function calculateTaskPriority(task) {
  const urgencyScore = task.deadline ? 
    (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24) : 100;
  const complexityMultiplier = task.complexity === 'high' ? 2 : 
    task.complexity === 'medium' ? 1.5 : 1;
  const energyFactor = task.energyLevel === 'high' ? 1.2 : 
    task.energyLevel === 'low' ? 0.8 : 1;
  return (urgencyScore * complexityMultiplier * energyFactor) / 10;
}`,
        refactoredCode: `function calculateTaskPriority(task) {
  const urgencyScore = calculateUrgencyScore(task);
  const complexityMultiplier = getComplexityMultiplier(task.complexity);
  const energyFactor = getEnergyFactor(task.energyLevel);
  return (urgencyScore * complexityMultiplier * energyFactor) / 10;
}

function calculateUrgencyScore(task) {
  return task.deadline ? 
    (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24) : 100;
}

function getComplexityMultiplier(complexity) {
  switch(complexity) {
    case 'high': return 2;
    case 'medium': return 1.5;
    default: return 1;
  }
}

function getEnergyFactor(energyLevel) {
  switch(energyLevel) {
    case 'high': return 1.2;
    case 'low': return 0.8;
    default: return 1;
  }
}`,
        benefits: [
          "Improved readability",
          "Better testability",
          "Easier maintenance",
        ],
        effort: "minutes",
        impact: {
          readability: 8,
          performance: 2,
          maintainability: 9,
        },
      });

      // Remove Duplication Opportunity
      opportunities.push({
        id: `refactor-${index}-duplication`,
        type: "remove-duplication",
        severity: "high",
        file,
        line: 78 + index * 15,
        column: 8,
        title: "Remove Duplication: Similar validation logic",
        description:
          "Similar validation patterns are repeated across multiple components",
        originalCode: `// In TaskCard.tsx
const validateTask = (task) => {
  if (!task.title || task.title.trim().length === 0) {
    throw new Error('Title is required');
  }
  if (task.title.length > 100) {
    throw new Error('Title too long');
  }
};

// In CreateTaskModal.tsx  
const validateNewTask = (task) => {
  if (!task.title || task.title.trim().length === 0) {
    throw new Error('Title is required');
  }
  if (task.title.length > 100) {
    throw new Error('Title too long');
  }
};`,
        refactoredCode: `// In utils/validation.ts
export const validateTaskTitle = (title: string) => {
  if (!title || title.trim().length === 0) {
    throw new Error('Title is required');
  }
  if (title.length > 100) {
    throw new Error('Title too long');
  }
};

// In TaskCard.tsx
import { validateTaskTitle } from '../utils/validation';

const validateTask = (task) => {
  validateTaskTitle(task.title);
};

// In CreateTaskModal.tsx
import { validateTaskTitle } from '../utils/validation';

const validateNewTask = (task) => {
  validateTaskTitle(task.title);
};`,
        benefits: [
          "DRY principle",
          "Single source of truth",
          "Consistent validation",
        ],
        effort: "minutes",
        impact: {
          readability: 7,
          performance: 1,
          maintainability: 10,
        },
      });

      // Modernize Syntax Opportunity
      opportunities.push({
        id: `refactor-${index}-modernize`,
        type: "modernize-syntax",
        severity: "low",
        file,
        line: 120 + index * 20,
        column: 4,
        title: "Modernize: Use modern JavaScript features",
        description:
          "Code can benefit from modern ES6+ features and React patterns",
        originalCode: `class TaskManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      loading: false
    };
    this.handleTaskUpdate = this.handleTaskUpdate.bind(this);
  }

  handleTaskUpdate(taskId, updates) {
    const updatedTasks = this.state.tasks.map(function(task) {
      if (task.id === taskId) {
        return Object.assign({}, task, updates);
      }
      return task;
    });
    this.setState({ tasks: updatedTasks });
  }

  render() {
    return React.createElement('div', null, 
      this.state.tasks.map(function(task) {
        return React.createElement(TaskCard, { key: task.id, task: task });
      })
    );
  }
}`,
        refactoredCode: `const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTaskUpdate = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  }, []);

  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};`,
        benefits: [
          "Modern React patterns",
          "Better performance with hooks",
          "Type safety",
        ],
        effort: "hours",
        impact: {
          readability: 9,
          performance: 6,
          maintainability: 8,
        },
      });

      // Performance Opportunity
      opportunities.push({
        id: `refactor-${index}-performance`,
        type: "performance",
        severity: "high",
        file,
        line: 200 + index * 25,
        column: 6,
        title: "Performance: Optimize expensive operations",
        description:
          "Heavy computations can be memoized and expensive renders can be prevented",
        originalCode: `const TaskList = ({ tasks, filters }) => {
  // Expensive filtering and sorting on every render
  const filteredTasks = tasks
    .filter(task => {
      // Complex filtering logic
      const matchesType = !filters.type || task.type === filters.type;
      const matchesStatus = !filters.status || task.status === filters.status;
      const matchesSearch = !filters.search || 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      // Complex sorting logic
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <div>
      {filteredTasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};`,
        refactoredCode: `const TaskList = ({ tasks, filters }) => {
  // Memoize expensive filtering and sorting
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const matchesType = !filters.type || task.type === filters.type;
        const matchesStatus = !filters.status || task.status === filters.status;
        const matchesSearch = !filters.search || 
          task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          task.description.toLowerCase().includes(filters.search.toLowerCase());
        return matchesType && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });
  }, [tasks, filters]);

  return (
    <div>
      {filteredTasks.map(task => (
        <MemoizedTaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

const MemoizedTaskCard = React.memo(TaskCard);`,
        benefits: [
          "Reduced re-renders",
          "Better user experience",
          "Memory optimization",
        ],
        effort: "minutes",
        impact: {
          readability: 3,
          performance: 10,
          maintainability: 4,
        },
      });
    });

    return opportunities;
  }

  static generateRefactoringPlan(opportunities: RefactoringOpportunity[]): {
    highPriority: RefactoringOpportunity[];
    quickWins: RefactoringOpportunity[];
    longTerm: RefactoringOpportunity[];
  } {
    return {
      highPriority: opportunities.filter((op) => op.severity === "high"),
      quickWins: opportunities.filter(
        (op) => op.effort === "minutes" && op.severity !== "low"
      ),
      longTerm: opportunities.filter(
        (op) => op.effort === "hours" || op.effort === "days"
      ),
    };
  }

  static estimateRefactoringImpact(opportunities: RefactoringOpportunity[]): {
    totalReadabilityGain: number;
    totalPerformanceGain: number;
    totalMaintainabilityGain: number;
    estimatedTimeToComplete: string;
  } {
    const totalReadability = opportunities.reduce(
      (sum, op) => sum + op.impact.readability,
      0
    );
    const totalPerformance = opportunities.reduce(
      (sum, op) => sum + op.impact.performance,
      0
    );
    const totalMaintainability = opportunities.reduce(
      (sum, op) => sum + op.impact.maintainability,
      0
    );

    const effortToHours = { minutes: 0.5, hours: 3, days: 24 };
    const totalHours = opportunities.reduce(
      (sum, op) => sum + effortToHours[op.effort],
      0
    );

    return {
      totalReadabilityGain:
        Math.round((totalReadability / opportunities.length) * 10) / 10,
      totalPerformanceGain:
        Math.round((totalPerformance / opportunities.length) * 10) / 10,
      totalMaintainabilityGain:
        Math.round((totalMaintainability / opportunities.length) * 10) / 10,
      estimatedTimeToComplete:
        totalHours < 1
          ? "< 1 hour"
          : totalHours < 24
          ? `~${Math.ceil(totalHours)} hours`
          : `~${Math.ceil(totalHours / 24)} days`,
    };
  }
}

// Refactoring Dashboard Component
export function RefactoringDashboard({ tasks: _tasks }: { tasks: Task[] }) {
  const [session, setSession] = useState<RefactoringSession | null>(null);
  const [_selectedOpportunity, setSelectedOpportunity] =
    useState<RefactoringOpportunity | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "opportunities" | "plan" | "impact"
  >("overview");
  const [analyzing, setAnalyzing] = useState(false);

  const startAnalysis = async () => {
    setAnalyzing(true);
    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const filePaths = [
      "src/components/TaskCard.tsx",
      "src/components/CreateTaskModal.tsx",
      "src/hooks/useTasks.ts",
      "src/lib/utils.ts",
    ];

    const newSession =
      AIRefactoringAssistant.analyzeCodeForRefactoring(filePaths);
    setSession(newSession);
    setAnalyzing(false);
  };

  const applyRefactoring = (opportunityId: string) => {
    if (!session) return;

    const updatedSession = {
      ...session,
      appliedRefactorings: [...session.appliedRefactorings, opportunityId],
    };
    setSession(updatedSession);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    }
  };

  const getTypeIcon = (type: RefactoringOpportunity["type"]) => {
    switch (type) {
      case "extract-method":
        return <Code className="w-4 h-4" />;
      case "remove-duplication":
        return <Copy className="w-4 h-4" />;
      case "simplify-condition":
        return <Lightbulb className="w-4 h-4" />;
      case "modernize-syntax":
        return <Star className="w-4 h-4" />;
      case "performance":
        return <Zap className="w-4 h-4" />;
      case "accessibility":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  const impact = session
    ? AIRefactoringAssistant.estimateRefactoringImpact(session.opportunities)
    : null;
  const plan = session
    ? AIRefactoringAssistant.generateRefactoringPlan(session.opportunities)
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            AI Code Refactoring
          </h3>
        </div>
        <button
          onClick={startAnalysis}
          disabled={analyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {analyzing ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Lightbulb className="w-3 h-3" />
          )}
          {analyzing ? "Analyzing..." : "Analyze Code"}
        </button>
      </div>

      {!session ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">AI-Powered Code Analysis</p>
          <p className="text-sm max-w-md mx-auto">
            Analyze your codebase for refactoring opportunities using advanced
            AI. Identify code smells, performance issues, and modernization
            opportunities.
          </p>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: "overview", label: "Overview", icon: FileText },
              {
                key: "opportunities",
                label: "Opportunities",
                icon: Lightbulb,
                count: session.opportunities.length,
              },
              { key: "plan", label: "Refactoring Plan", icon: ArrowRight },
              { key: "impact", label: "Impact Analysis", icon: Star },
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
                  {tab.count !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-medium text-indigo-800 dark:text-indigo-200">
                      Opportunities
                    </span>
                  </div>
                  <div className="text-lg font-bold text-indigo-600">
                    {session.opportunities.length}
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-medium text-red-800 dark:text-red-200">
                      High Priority
                    </span>
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    {
                      session.opportunities.filter(
                        (op) => op.severity === "high"
                      ).length
                    }
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-800 dark:text-green-200">
                      Applied
                    </span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {session.appliedRefactorings.length}
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                      Est. Time
                    </span>
                  </div>
                  <div className="text-xs font-bold text-purple-600">
                    {impact?.estimatedTimeToComplete || "N/A"}
                  </div>
                </div>
              </div>

              {/* Recent Opportunities */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Top Refactoring Opportunities
                </h4>
                <div className="space-y-2">
                  {session.opportunities.slice(0, 3).map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer"
                      onClick={() => setSelectedOpportunity(opportunity)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-indigo-600 dark:text-indigo-400">
                          {getTypeIcon(opportunity.type)}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {opportunity.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {opportunity.file}:{opportunity.line}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                            opportunity.severity
                          )}`}
                        >
                          {opportunity.severity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {opportunity.effort}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Opportunities Tab */}
          {activeTab === "opportunities" && (
            <div className="space-y-3">
              {session.opportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {getTypeIcon(opportunity.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {opportunity.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {opportunity.description}
                        </p>
                        <div className="text-xs text-gray-500 mt-2">
                          {opportunity.file}:{opportunity.line}:
                          {opportunity.column}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                          opportunity.severity
                        )}`}
                      >
                        {opportunity.severity}
                      </span>
                      <span className="text-xs text-gray-500">
                        {opportunity.effort}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Current Code
                      </h5>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded border overflow-auto max-h-40">
                        <code>{opportunity.originalCode}</code>
                      </pre>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Refactored Code
                      </h5>
                      <pre className="text-xs bg-green-50 dark:bg-green-900/20 p-3 rounded border overflow-auto max-h-40">
                        <code>{opportunity.refactoredCode}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Readability:</span>
                        <span className="font-medium">
                          {opportunity.impact.readability}/10
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Performance:</span>
                        <span className="font-medium">
                          {opportunity.impact.performance}/10
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Maintainability:</span>
                        <span className="font-medium">
                          {opportunity.impact.maintainability}/10
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            opportunity.refactoredCode
                          )
                        }
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Copy Code
                      </button>
                      <button
                        onClick={() => applyRefactoring(opportunity.id)}
                        disabled={session.appliedRefactorings.includes(
                          opportunity.id
                        )}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {session.appliedRefactorings.includes(opportunity.id)
                          ? "Applied"
                          : "Apply"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Plan Tab */}
          {activeTab === "plan" && plan && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {/* High Priority */}
                {plan.highPriority.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200/50 dark:border-red-800/50">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      High Priority ({plan.highPriority.length})
                    </h4>
                    <div className="space-y-2">
                      {plan.highPriority.map((op) => (
                        <div
                          key={op.id}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          • {op.title} - {op.effort}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Wins */}
                {plan.quickWins.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200/50 dark:border-green-800/50">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      Quick Wins ({plan.quickWins.length})
                    </h4>
                    <div className="space-y-2">
                      {plan.quickWins.map((op) => (
                        <div
                          key={op.id}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          • {op.title} - {op.effort}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Long Term */}
                {plan.longTerm.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                      Long Term ({plan.longTerm.length})
                    </h4>
                    <div className="space-y-2">
                      {plan.longTerm.map((op) => (
                        <div
                          key={op.id}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          • {op.title} - {op.effort}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Impact Tab */}
          {activeTab === "impact" && impact && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {impact.totalReadabilityGain}/10
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    Readability Gain
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {impact.totalPerformanceGain}/10
                  </div>
                  <div className="text-sm text-green-800 dark:text-green-200">
                    Performance Gain
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {impact.totalMaintainabilityGain}/10
                  </div>
                  <div className="text-sm text-purple-800 dark:text-purple-200">
                    Maintainability Gain
                  </div>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Estimated Time Investment
                </h4>
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {impact.estimatedTimeToComplete}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Time required to complete all identified refactoring
                  opportunities
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
