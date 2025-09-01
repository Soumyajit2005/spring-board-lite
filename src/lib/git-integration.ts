"use client";

import { Task } from "@/lib/types";

export class GitIntegrationService {
  private static instance: GitIntegrationService;

  static getInstance(): GitIntegrationService {
    if (!this.instance) {
      this.instance = new GitIntegrationService();
    }
    return this.instance;
  }

  // Check recent commits and auto-complete tasks
  async checkForTaskCompletions(tasks: Task[]): Promise<string[]> {
    const completedTaskIds: string[] = [];

    for (const task of tasks) {
      if (task.status === "done" || !task.scheduling?.gitIntegration) continue;

      const {
        repositoryUrl,
        branch = "main",
        commitPattern,
        autoComplete,
      } = task.scheduling.gitIntegration;

      if (!repositoryUrl || !autoComplete) continue;

      try {
        const isCompleted = await this.checkCommitPattern(
          repositoryUrl,
          branch,
          commitPattern,
          task
        );
        if (isCompleted) {
          completedTaskIds.push(task.id);
        }
      } catch (error) {
        console.warn(`Failed to check Git commits for task ${task.id}:`, error);
      }
    }

    return completedTaskIds;
  }

  // Check if commits match the task pattern
  private async checkCommitPattern(
    repositoryUrl: string,
    branch: string,
    pattern: string | undefined,
    task: Task
  ): Promise<boolean> {
    // Since we can't actually access Git APIs in this demo, we'll simulate it
    // In a real app, you'd integrate with GitHub API, GitLab API, etc.

    const simulatedCommits = this.generateSimulatedCommits(task);

    const searchPatterns = [
      pattern,
      task.id,
      task.title.toLowerCase(),
      `fix: ${task.title.toLowerCase()}`,
      `feat: ${task.title.toLowerCase()}`,
      `task: ${task.id}`,
    ].filter(Boolean);

    return simulatedCommits.some((commit) =>
      searchPatterns.some(
        (searchPattern) =>
          searchPattern &&
          commit.message.toLowerCase().includes(searchPattern.toLowerCase())
      )
    );
  }

  // Generate simulated commits (in real app, this would fetch from Git API)
  private generateSimulatedCommits(
    task: Task
  ): Array<{ message: string; date: string; author: string }> {
    const now = new Date();
    const messages = [
      `feat: implement ${task.title}`,
      `fix: resolve issue with ${task.title}`,
      `task: complete ${task.id} - ${task.title}`,
      `update: finalize ${task.title}`,
      `refactor: improve ${task.title} implementation`,
    ];

    // Simulate some recent commits
    return Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
      message: messages[Math.floor(Math.random() * messages.length)],
      date: new Date(now.getTime() - i * 60 * 60 * 1000).toISOString(),
      author: "Developer",
    }));
  }

  // Generate commit message suggestions
  generateCommitMessage(task: Task): string[] {
    const taskType = task.scheduling?.developerContext?.taskType || "feat";
    const title = task.title.toLowerCase();

    const prefixes = {
      coding: "feat",
      debugging: "fix",
      research: "docs",
      documentation: "docs",
      testing: "test",
      review: "refactor",
      meeting: "chore",
      planning: "chore",
    };

    const prefix = prefixes[taskType as keyof typeof prefixes] || "feat";

    return [
      `${prefix}: ${title}`,
      `${prefix}(${
        task.scheduling?.developerContext?.techStack?.[0] || "core"
      }): ${title}`,
      `task: ${task.id} - ${title}`,
      `${prefix}: complete ${title} implementation`,
      `${prefix}: resolve ${title} requirements`,
    ];
  }

  // Analyze repository activity for scheduling insights
  async analyzeRepositoryActivity(repositoryUrl: string): Promise<{
    peakCommitHours: number[];
    averageCommitSize: number;
    frequentCommitTypes: string[];
  }> {
    // Simulate repository analysis
    return {
      peakCommitHours: [9, 10, 14, 15, 16], // Peak coding hours
      averageCommitSize: 150, // lines changed
      frequentCommitTypes: ["feat", "fix", "refactor", "docs"],
    };
  }

  // Smart Git workflow suggestions
  generateWorkflowSuggestions(task: Task): string[] {
    const suggestions: string[] = [];
    const context = task.scheduling?.developerContext;

    if (context?.taskType === "coding") {
      suggestions.push("🔄 Consider creating a feature branch for this task");
      suggestions.push("✨ Use conventional commits for better tracking");
    }

    if (context?.complexity === "complex") {
      suggestions.push("🔍 Break this into smaller commits for easier review");
      suggestions.push("📝 Document major decisions in commit messages");
    }

    if (task.scheduling?.dependencies?.length) {
      suggestions.push("🔗 Ensure dependent tasks are merged before starting");
    }

    if (context?.focusTime) {
      suggestions.push("🚫 Avoid interruptions - this task needs deep focus");
    }

    return suggestions;
  }

  // Repository health metrics
  async getRepositoryMetrics(repositoryUrl: string): Promise<{
    codeQuality: number;
    testCoverage: number;
    activeContributors: number;
    issueResolutionTime: number;
  }> {
    // Simulate repository metrics
    return {
      codeQuality: Math.floor(Math.random() * 30) + 70, // 70-100
      testCoverage: Math.floor(Math.random() * 40) + 60, // 60-100
      activeContributors: Math.floor(Math.random() * 10) + 1, // 1-10
      issueResolutionTime: Math.floor(Math.random() * 5) + 1, // 1-5 days
    };
  }
}
