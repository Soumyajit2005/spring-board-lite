import { GoogleGenerativeAI } from "@google/generative-ai";
import { Task, TaskPriority } from "./types";

// Configuration
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = process.env.AI_MODEL || "gemini-1.5-flash";
const REQUEST_TIMEOUT = parseInt(process.env.AI_REQUEST_TIMEOUT || "30000");
const MAX_RETRIES = parseInt(process.env.AI_RETRY_ATTEMPTS || "3");

// Initialize Gemini AI
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// AI Response Types
export interface AITaskCategorization {
  category: string;
  confidence: number;
  reasoning: string;
  suggestedPriority?: TaskPriority;
}

export interface AITimeEstimation {
  estimatedHours: number;
  confidence: number;
  factors: string[];
  breakdown?: {
    planning: number;
    implementation: number;
    testing: number;
    review: number;
  };
}

export interface AITaskSuggestion {
  title: string;
  description: string;
  priority: TaskPriority;
  reasoning: string;
  confidence: number;
}

export interface AIProductivityInsight {
  type:
    | "burnout_warning"
    | "productivity_trend"
    | "completion_probability"
    | "suggestion";
  severity: "low" | "medium" | "high";
  message: string;
  data?: any;
  actions?: string[];
}

export interface AIEnhancedDescription {
  enhancedDescription: string;
  improvements: string[];
  clarity_score: number;
}

// Core AI Service Class
class AIService {
  private model: any = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      if (!genAI) {
        console.warn("Gemini AI not configured - AI features will be disabled");
        return;
      }

      this.model = genAI.getGenerativeModel({ model: MODEL_NAME });
      this.isInitialized = true;
      console.log("AI Service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AI Service:", error);
      this.isInitialized = false;
    }
  }

  private async makeRequest(prompt: string, retries = 0): Promise<string> {
    if (!this.isInitialized || !this.model) {
      throw new Error("AI Service not initialized");
    }

    try {
      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Request timeout")),
            REQUEST_TIMEOUT
          )
        ),
      ]);

      return result.response.text();
    } catch (error) {
      if (retries < MAX_RETRIES) {
        console.warn(
          `AI request failed, retrying... (${retries + 1}/${MAX_RETRIES})`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retries + 1))
        );
        return this.makeRequest(prompt, retries + 1);
      }
      throw error;
    }
  }

  // Task Categorization
  async categorizeTask(
    task: Pick<Task, "title" | "description">
  ): Promise<AITaskCategorization> {
    const prompt = `
Analyze this task and categorize it. Return a JSON response with the following structure:
{
  "category": "string (e.g., 'Development', 'Design', 'Research', 'Testing', 'Documentation', 'Meeting', 'Bug Fix', 'Feature')",
  "confidence": number (0-1),
  "reasoning": "string explaining the categorization",
  "suggestedPriority": "low|medium|high"
}

Task:
Title: ${task.title}
Description: ${task.description}

Consider the complexity, urgency indicators, and typical categorizations for software development tasks.
`;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(this.cleanJsonResponse(response));
    } catch (error) {
      console.error("Task categorization failed:", error);
      return {
        category: "General",
        confidence: 0.1,
        reasoning: "AI categorization unavailable",
      };
    }
  }

  // Time Estimation
  async estimateTaskTime(
    task: Pick<Task, "title" | "description" | "priority">,
    userHistory?: { averageCompletionTime: number; completedTasks: number }
  ): Promise<AITimeEstimation> {
    const prompt = `
Estimate the time required to complete this task. Consider the user's history if provided.
Return JSON response with this structure:
{
  "estimatedHours": number,
  "confidence": number (0-1),
  "factors": ["array of factors affecting the estimate"],
  "breakdown": {
    "planning": number,
    "implementation": number,
    "testing": number,
    "review": number
  }
}

Task:
Title: ${task.title}
Description: ${task.description}
Priority: ${task.priority}

${
  userHistory
    ? `User History:
- Average completion time: ${userHistory.averageCompletionTime} hours
- Completed tasks: ${userHistory.completedTasks}`
    : ""
}

Base your estimate on software development best practices and the complexity indicated in the description.
`;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(this.cleanJsonResponse(response));
    } catch (error) {
      console.error("Time estimation failed:", error);
      return {
        estimatedHours: 2,
        confidence: 0.1,
        factors: ["AI estimation unavailable"],
      };
    }
  }

  // Task Suggestions
  async generateTaskSuggestions(
    currentTasks: Task[],
    completedTasks: Task[],
    _workloadAnalysis: any
  ): Promise<AITaskSuggestion[]> {
    const prompt = `
Analyze the current workload and suggest 3 relevant tasks that would be beneficial to add.
Return JSON array with this structure:
[{
  "title": "string",
  "description": "string",
  "priority": "low|medium|high",
  "reasoning": "string explaining why this task is suggested",
  "confidence": number (0-1)
}]

Current Tasks (${currentTasks.length}):
${currentTasks
  .slice(0, 10)
  .map(
    (t) =>
      `- ${t.title} (${t.status}, ${t.priority}): ${t.description.slice(
        0,
        100
      )}`
  )
  .join("\n")}

Recent Completed Tasks (${completedTasks.length}):
${completedTasks
  .slice(0, 5)
  .map((t) => `- ${t.title} (${t.priority}): ${t.description.slice(0, 100)}`)
  .join("\n")}

Suggest tasks that complement the current work, fill gaps, or improve productivity.
Focus on software development, testing, documentation, and process improvements.
`;

    try {
      const response = await this.makeRequest(prompt);
      const suggestions = JSON.parse(this.cleanJsonResponse(response));
      return Array.isArray(suggestions) ? suggestions.slice(0, 3) : [];
    } catch (error) {
      console.error("Task suggestions failed:", error);
      return [];
    }
  }

  // Description Enhancement
  async enhanceTaskDescription(
    task: Pick<Task, "title" | "description">
  ): Promise<AIEnhancedDescription> {
    const prompt = `
Improve this task description for clarity, completeness, and actionability.
Return JSON response:
{
  "enhancedDescription": "string - improved description",
  "improvements": ["array of specific improvements made"],
  "clarity_score": number (1-10)
}

Original Task:
Title: ${task.title}
Description: ${task.description}

Make the description more specific, actionable, and clear while preserving the original intent.
Add acceptance criteria or steps if appropriate.
`;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(this.cleanJsonResponse(response));
    } catch (error) {
      console.error("Description enhancement failed:", error);
      return {
        enhancedDescription: task.description,
        improvements: ["AI enhancement unavailable"],
        clarity_score: 5,
      };
    }
  }

  // Productivity Analysis
  async analyzeProductivity(
    tasks: Task[],
    _timeSpent: { [taskId: string]: number },
    userPatterns: any
  ): Promise<AIProductivityInsight[]> {
    const prompt = `
Analyze productivity patterns and provide insights.
Return JSON array of insights:
[{
  "type": "burnout_warning|productivity_trend|completion_probability|suggestion",
  "severity": "low|medium|high",
  "message": "string",
  "data": {},
  "actions": ["array of actionable recommendations"]
}]

Tasks Data:
- Total tasks: ${tasks.length}
- Todo: ${tasks.filter((t) => t.status === "todo").length}
- In Progress: ${tasks.filter((t) => t.status === "in-progress").length}
- Done: ${tasks.filter((t) => t.status === "done").length}
- High Priority: ${tasks.filter((t) => t.priority === "high").length}

Time Patterns: ${JSON.stringify(userPatterns, null, 2)}

Analyze for burnout risk, completion patterns, and productivity optimization opportunities.
`;

    try {
      const response = await this.makeRequest(prompt);
      const insights = JSON.parse(this.cleanJsonResponse(response));
      return Array.isArray(insights) ? insights : [];
    } catch (error) {
      console.error("Productivity analysis failed:", error);
      return [
        {
          type: "suggestion",
          severity: "low",
          message: "AI productivity analysis unavailable",
          actions: ["Check AI service configuration"],
        },
      ];
    }
  }

  // Completion Probability
  async calculateCompletionProbability(
    tasks: Task[],
    deadline: Date,
    historicalData: any
  ): Promise<{ probability: number; confidence: number; factors: string[] }> {
    const prompt = `
Calculate the probability of completing all tasks by the deadline.
Return JSON:
{
  "probability": number (0-1),
  "confidence": number (0-1),
  "factors": ["array of factors affecting completion probability"]
}

Tasks to complete: ${tasks.filter((t) => t.status !== "done").length}
Deadline: ${deadline.toISOString()}
Days remaining: ${Math.ceil(
      (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )}

Task breakdown:
${tasks.map((t) => `- ${t.title} (${t.status}, ${t.priority})`).join("\n")}

Historical data: ${JSON.stringify(historicalData, null, 2)}

Consider task complexity, priorities, remaining time, and historical completion rates.
`;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(this.cleanJsonResponse(response));
    } catch (error) {
      console.error("Completion probability calculation failed:", error);
      return {
        probability: 0.5,
        confidence: 0.1,
        factors: ["AI calculation unavailable"],
      };
    }
  }

  // Utility method to clean JSON responses
  private cleanJsonResponse(response: string): string {
    // Remove markdown code blocks if present
    let cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    // Find the JSON content between first { and last }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");

    if (
      firstBracket !== -1 &&
      (firstBrace === -1 || firstBracket < firstBrace)
    ) {
      // Array response
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    } else if (firstBrace !== -1) {
      // Object response
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return cleaned.trim();
  }

  // Health check
  isAvailable(): boolean {
    return this.isInitialized && !!this.model;
  }
}

// Singleton instance
export const aiService = new AIService();

// Utility functions for AI features
export const aiUtils = {
  isAIEnabled: () => {
    return (
      process.env.NEXT_PUBLIC_AI_ENABLED === "true" && aiService.isAvailable()
    );
  },

  formatInsightMessage: (insight: AIProductivityInsight): string => {
    const icons = {
      burnout_warning: "⚠️",
      productivity_trend: "📈",
      completion_probability: "🎯",
      suggestion: "💡",
    };

    return `${icons[insight.type]} ${insight.message}`;
  },

  getPriorityColor: (priority: TaskPriority): string => {
    const colors = {
      low: "text-gray-500",
      medium: "text-yellow-500",
      high: "text-red-500",
    };
    return colors[priority];
  },
};
