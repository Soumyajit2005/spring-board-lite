"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Network,
  GitBranch,
  ArrowRight,
  Circle,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  RotateCcw,
  Eye,
  Play,
} from "lucide-react";
import { Task } from "@/lib/types";

export interface TaskNode {
  id: string;
  task: Task;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  level: number;
  children: string[];
  parents: string[];
}

export interface TaskEdge {
  source: string;
  target: string;
  type: "blocks" | "enables" | "related" | "parallel";
  strength: number;
}

export interface DependencyAnalysis {
  criticalPath: string[];
  bottlenecks: string[];
  parallelizable: string[][];
  cyclicDependencies: string[];
  complexity: number;
  estimatedDuration: number;
}

export class IntelligentDependencyAnalyzer {
  static analyzeDependencies(tasks: Task[]): {
    nodes: TaskNode[];
    edges: TaskEdge[];
    analysis: DependencyAnalysis;
  } {
    const nodes = this.createNodes(tasks);
    const edges = this.createEdges(tasks, nodes);
    const analysis = this.performAnalysis(nodes, edges);

    return { nodes, edges, analysis };
  }

  private static createNodes(tasks: Task[]): TaskNode[] {
    return tasks.map((task) => ({
      id: task.id,
      task,
      x: Math.random() * 800,
      y: Math.random() * 600,
      level: 0,
      children: task.scheduling?.dependencies || [],
      parents: [],
    }));
  }

  private static createEdges(tasks: Task[], nodes: TaskNode[]): TaskEdge[] {
    const edges: TaskEdge[] = [];

    tasks.forEach((task) => {
      const dependencies = task.scheduling?.dependencies || [];
      dependencies.forEach((depId) => {
        const depTask = tasks.find((t) => t.id === depId);
        if (depTask) {
          edges.push({
            source: depId,
            target: task.id,
            type: this.determineDependencyType(task, depTask),
            strength: this.calculateDependencyStrength(task, depTask),
          });
        }
      });
    });

    // Add parent relationships
    edges.forEach((edge) => {
      const targetNode = nodes.find((n) => n.id === edge.target);
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (targetNode && sourceNode) {
        targetNode.parents.push(edge.source);
      }
    });

    return edges;
  }

  private static determineDependencyType(
    task: Task,
    depTask: Task
  ): TaskEdge["type"] {
    // Analyze task types and relationships to determine dependency type
    const taskType = task.scheduling?.developerContext?.taskType;
    const depType = depTask.scheduling?.developerContext?.taskType;

    if (taskType === "testing" && depType === "coding") return "blocks";
    if (taskType === "documentation" && depType === "coding") return "enables";
    if (taskType === depType) return "related";

    return "blocks"; // Default
  }

  private static calculateDependencyStrength(
    task: Task,
    depTask: Task
  ): number {
    // Calculate strength based on complexity, priority, and type similarity
    const taskComplexity =
      task.scheduling?.developerContext?.complexity || "moderate";
    const depComplexity =
      depTask.scheduling?.developerContext?.complexity || "moderate";

    const complexityScore = {
      simple: 1,
      moderate: 2,
      complex: 3,
    };

    const taskScore = complexityScore[taskComplexity];
    const depScore = complexityScore[depComplexity];

    return Math.min(10, (taskScore + depScore) * 1.5);
  }

  private static performAnalysis(
    nodes: TaskNode[],
    edges: TaskEdge[]
  ): DependencyAnalysis {
    const criticalPath = this.findCriticalPath(nodes, edges);
    const bottlenecks = this.identifyBottlenecks(nodes, edges);
    const parallelizable = this.findParallelizableTasks(nodes, edges);
    const cyclicDependencies = this.detectCycles(nodes, edges);
    const complexity = this.calculateComplexity(nodes, edges);
    const estimatedDuration = this.estimateDuration(nodes, criticalPath);

    return {
      criticalPath,
      bottlenecks,
      parallelizable,
      cyclicDependencies,
      complexity,
      estimatedDuration,
    };
  }

  private static findCriticalPath(
    nodes: TaskNode[],
    edges: TaskEdge[]
  ): string[] {
    // Simplified critical path algorithm
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const visited = new Set<string>();
    const path: string[] = [];

    // Find root nodes (no dependencies)
    const rootNodes = nodes.filter((n) => n.parents.length === 0);

    if (rootNodes.length > 0) {
      this.dfsLongestPath(rootNodes[0].id, nodeMap, edges, visited, path);
    }

    return path;
  }

  private static dfsLongestPath(
    nodeId: string,
    nodeMap: Map<string, TaskNode>,
    edges: TaskEdge[],
    visited: Set<string>,
    path: string[]
  ): void {
    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    path.push(nodeId);

    const children = edges
      .filter((e) => e.source === nodeId)
      .map((e) => e.target);

    if (children.length > 0) {
      // Follow the path with highest complexity/duration
      const nextNode = children[0]; // Simplified - should pick longest path
      this.dfsLongestPath(nextNode, nodeMap, edges, visited, path);
    }
  }

  private static identifyBottlenecks(
    nodes: TaskNode[],
    edges: TaskEdge[]
  ): string[] {
    // Nodes with many dependencies or that block many other tasks
    const bottlenecks: string[] = [];

    nodes.forEach((node) => {
      const dependentCount = edges.filter((e) => e.source === node.id).length;
      const dependencyCount = node.parents.length;

      if (dependentCount > 2 || dependencyCount > 2) {
        bottlenecks.push(node.id);
      }
    });

    return bottlenecks;
  }

  private static findParallelizableTasks(
    nodes: TaskNode[],
    edges: TaskEdge[]
  ): string[][] {
    // Find tasks that can run in parallel (no dependencies between them)
    const parallelGroups: string[][] = [];
    const processed = new Set<string>();

    nodes.forEach((node) => {
      if (processed.has(node.id)) return;

      const parallelTasks = [node.id];
      processed.add(node.id);

      // Find other tasks with same level and no dependencies
      nodes.forEach((otherNode) => {
        if (otherNode.id === node.id || processed.has(otherNode.id)) return;

        const hasDirectConnection = edges.some(
          (edge) =>
            (edge.source === node.id && edge.target === otherNode.id) ||
            (edge.source === otherNode.id && edge.target === node.id)
        );

        if (!hasDirectConnection && node.level === otherNode.level) {
          parallelTasks.push(otherNode.id);
          processed.add(otherNode.id);
        }
      });

      if (parallelTasks.length > 1) {
        parallelGroups.push(parallelTasks);
      }
    });

    return parallelGroups;
  }

  private static detectCycles(_nodes: TaskNode[], edges: TaskEdge[]): string[] {
    // Simplified cycle detection
    const cycles: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        cycles.push(nodeId);
        return true;
      }
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = edges
        .filter((e) => e.source === nodeId)
        .map((e) => e.target);

      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    edges.forEach((edge) => {
      if (!visited.has(edge.source)) {
        dfs(edge.source);
      }
    });

    return [...new Set(cycles)];
  }

  private static calculateComplexity(
    nodes: TaskNode[],
    edges: TaskEdge[]
  ): number {
    // Complexity based on node count, edge count, and structure
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const maxLevel = Math.max(...nodes.map((n) => n.level), 0);

    return Math.min(10, nodeCount * 0.1 + edgeCount * 0.2 + maxLevel * 0.5);
  }

  private static estimateDuration(
    nodes: TaskNode[],
    criticalPath: string[]
  ): number {
    // Sum durations along critical path
    return criticalPath.reduce((total, nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      const duration = node?.task.scheduling?.estimatedDuration || 60;
      return total + duration;
    }, 0);
  }

  static generateOptimizationSuggestions(
    analysis: DependencyAnalysis,
    _nodes: TaskNode[]
  ): string[] {
    const suggestions: string[] = [];

    if (analysis.bottlenecks.length > 0) {
      suggestions.push(
        `Consider breaking down ${analysis.bottlenecks.length} bottleneck tasks to reduce dependencies`
      );
    }

    if (analysis.parallelizable.length > 0) {
      const parallelCount = analysis.parallelizable.reduce(
        (sum, group) => sum + group.length,
        0
      );
      suggestions.push(
        `${parallelCount} tasks can be executed in parallel to reduce overall timeline`
      );
    }

    if (analysis.cyclicDependencies.length > 0) {
      suggestions.push(
        `Resolve ${analysis.cyclicDependencies.length} circular dependencies to prevent deadlocks`
      );
    }

    if (analysis.complexity > 7) {
      suggestions.push(
        "Consider simplifying the dependency structure for better maintainability"
      );
    }

    if (analysis.criticalPath.length > 5) {
      suggestions.push(
        "Critical path is long - look for opportunities to parallelize work"
      );
    }

    return suggestions;
  }
}

// Dependency Visualizer Component
export function TaskDependencyVisualizer({ tasks }: { tasks: Task[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dependencyData, setDependencyData] = useState<{
    nodes: TaskNode[];
    edges: TaskEdge[];
    analysis: DependencyAnalysis;
  } | null>(null);

  const [selectedNode, setSelectedNode] = useState<TaskNode | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "analysis" | "timeline">(
    "graph"
  );
  const [filterType, setFilterType] = useState<
    "all" | "critical" | "bottlenecks" | "parallel"
  >("all");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (tasks.length > 0) {
      const data = IntelligentDependencyAnalyzer.analyzeDependencies(tasks);
      setDependencyData(data);
    }
  }, [tasks]);

  const getNodeColor = (node: TaskNode) => {
    if (!dependencyData) return "#6B7280";

    const { analysis } = dependencyData;

    if (analysis.criticalPath.includes(node.id)) return "#EF4444"; // Red for critical path
    if (analysis.bottlenecks.includes(node.id)) return "#F59E0B"; // Orange for bottlenecks
    if (analysis.cyclicDependencies.includes(node.id)) return "#8B5CF6"; // Purple for cycles

    const isParallel = analysis.parallelizable.some((group) =>
      group.includes(node.id)
    );
    if (isParallel) return "#10B981"; // Green for parallelizable

    return "#6B7280"; // Default gray
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "done":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "in-progress":
        return <Clock className="w-3 h-3 text-blue-500" />;
      case "blocked":
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default:
        return <Circle className="w-3 h-3 text-gray-400" />;
    }
  };

  const runSimulation = () => {
    setIsAnimating(true);
    // Simple force simulation
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  const filteredData = dependencyData
    ? {
        ...dependencyData,
        nodes: dependencyData.nodes.filter((node) => {
          switch (filterType) {
            case "critical":
              return dependencyData.analysis.criticalPath.includes(node.id);
            case "bottlenecks":
              return dependencyData.analysis.bottlenecks.includes(node.id);
            case "parallel":
              return dependencyData.analysis.parallelizable.some((group) =>
                group.includes(node.id)
              );
            default:
              return true;
          }
        }),
      }
    : null;

  const suggestions = dependencyData
    ? IntelligentDependencyAnalyzer.generateOptimizationSuggestions(
        dependencyData.analysis,
        dependencyData.nodes
      )
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Task Dependencies Visualizer
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
          >
            <option value="all">All Tasks</option>
            <option value="critical">Critical Path</option>
            <option value="bottlenecks">Bottlenecks</option>
            <option value="parallel">Parallelizable</option>
          </select>
          <button
            onClick={runSimulation}
            disabled={isAnimating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isAnimating ? (
              <RotateCcw className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            {isAnimating ? "Simulating..." : "Run Simulation"}
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { key: "graph", label: "Dependency Graph", icon: Network },
          { key: "analysis", label: "Analysis", icon: Eye },
          { key: "timeline", label: "Timeline", icon: GitBranch },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === tab.key
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

      {!dependencyData ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">
            No Dependencies to Visualize
          </p>
          <p className="text-sm max-w-md mx-auto">
            Add task dependencies to see the intelligent dependency graph and
            analysis.
          </p>
        </div>
      ) : (
        <>
          {/* Graph View */}
          {viewMode === "graph" && (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
              <div className="relative h-96 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                <svg
                  ref={svgRef}
                  className="w-full h-full"
                  viewBox="0 0 800 400"
                >
                  {/* Edges */}
                  {filteredData?.edges.map((edge, index) => {
                    const sourceNode = filteredData.nodes.find(
                      (n) => n.id === edge.source
                    );
                    const targetNode = filteredData.nodes.find(
                      (n) => n.id === edge.target
                    );

                    if (!sourceNode || !targetNode) return null;

                    return (
                      <g key={`edge-${index}`}>
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke="#6B7280"
                          strokeWidth={Math.max(1, edge.strength / 5)}
                          opacity={0.6}
                          markerEnd="url(#arrowhead)"
                        />
                      </g>
                    );
                  })}

                  {/* Arrow marker */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
                    </marker>
                  </defs>

                  {/* Nodes */}
                  {filteredData?.nodes.map((node) => (
                    <g key={`node-${node.id}`}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={Math.max(
                          15,
                          node.children.length * 3 + node.parents.length * 3
                        )}
                        fill={getNodeColor(node)}
                        stroke="#fff"
                        strokeWidth="2"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedNode(node)}
                      />
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs font-medium fill-white pointer-events-none"
                      >
                        {node.task.title.substring(0, 8)}...
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Legend */}
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Critical Path</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>Bottlenecks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Parallelizable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Cyclic Dependencies</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis View */}
          {viewMode === "analysis" && (
            <div className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowRight className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-medium text-red-800 dark:text-red-200">
                      Critical Path
                    </span>
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    {dependencyData.analysis.criticalPath.length}
                  </div>
                  <div className="text-xs text-red-500">tasks</div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-medium text-orange-800 dark:text-orange-200">
                      Bottlenecks
                    </span>
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    {dependencyData.analysis.bottlenecks.length}
                  </div>
                  <div className="text-xs text-orange-500">tasks</div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-800 dark:text-green-200">
                      Parallelizable
                    </span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {dependencyData.analysis.parallelizable.reduce(
                      (sum, group) => sum + group.length,
                      0
                    )}
                  </div>
                  <div className="text-xs text-green-500">tasks</div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      Duration
                    </span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round(dependencyData.analysis.estimatedDuration / 60)}
                    h
                  </div>
                  <div className="text-xs text-blue-500">estimated</div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Critical Path */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-red-600" />
                    Critical Path
                  </h4>
                  <div className="space-y-2">
                    {dependencyData.analysis.criticalPath.map(
                      (taskId, index) => {
                        const node = dependencyData.nodes.find(
                          (n) => n.id === taskId
                        );
                        return (
                          <div
                            key={taskId}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="text-xs text-gray-500 w-6">
                              {index + 1}.
                            </span>
                            <span className="flex-1 text-gray-900 dark:text-white">
                              {node?.task.title || "Unknown Task"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {node?.task.scheduling?.estimatedDuration || 60}m
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Parallelizable Groups */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    Parallel Groups
                  </h4>
                  <div className="space-y-3">
                    {dependencyData.analysis.parallelizable.map(
                      (group, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 dark:border-gray-600 rounded p-2"
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            Group {index + 1}
                          </div>
                          <div className="space-y-1">
                            {group.map((taskId) => {
                              const node = dependencyData.nodes.find(
                                (n) => n.id === taskId
                              );
                              return (
                                <div
                                  key={taskId}
                                  className="text-sm text-gray-900 dark:text-white"
                                >
                                  • {node?.task.title || "Unknown Task"}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Optimization Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    Optimization Suggestions
                  </h4>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline View */}
          {viewMode === "timeline" && (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Project Timeline
              </h4>

              <div className="space-y-3">
                {dependencyData.analysis.criticalPath.map((taskId, index) => {
                  const node = dependencyData.nodes.find(
                    (n) => n.id === taskId
                  );
                  const isLast =
                    index === dependencyData.analysis.criticalPath.length - 1;

                  return (
                    <div key={taskId} className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${getNodeColor(
                            node!
                          )} border-2 border-white`}
                        />
                        {!isLast && (
                          <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 mt-1" />
                        )}
                      </div>

                      <div className="flex-1 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {node?.task.title}
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(node?.task.status || "pending")}
                            <span className="text-xs text-gray-500">
                              {node?.task.scheduling?.estimatedDuration || 60}m
                            </span>
                          </div>
                        </div>

                        {node?.task.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {node.task.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Selected Node Details Modal */}
      {selectedNode && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {selectedNode.task.title}
                </h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Description
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {selectedNode.task.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Dependencies
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {selectedNode.parents.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Blocks
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {selectedNode.children.length}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Analysis
                </div>
                <div className="space-y-1 text-sm">
                  {dependencyData?.analysis.criticalPath.includes(
                    selectedNode.id
                  ) && <div className="text-red-600">• On critical path</div>}
                  {dependencyData?.analysis.bottlenecks.includes(
                    selectedNode.id
                  ) && (
                    <div className="text-orange-600">
                      • Potential bottleneck
                    </div>
                  )}
                  {dependencyData?.analysis.parallelizable.some((group) =>
                    group.includes(selectedNode.id)
                  ) && (
                    <div className="text-green-600">• Can run in parallel</div>
                  )}
                  {dependencyData?.analysis.cyclicDependencies.includes(
                    selectedNode.id
                  ) && (
                    <div className="text-purple-600">
                      • Part of dependency cycle
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
