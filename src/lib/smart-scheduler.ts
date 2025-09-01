"use client";

import {
  Task,
  DeveloperProfile,
  ScheduleSlot,
  EnergyLevel,
  DeveloperTaskType,
} from "@/lib/types";

export class SmartScheduler {
  private developerProfile: DeveloperProfile;

  constructor(profile: DeveloperProfile) {
    this.developerProfile = profile;
  }

  // Main scheduling function
  scheduleTasks(tasks: Task[]): ScheduleSlot[] {
    const unscheduledTasks = tasks.filter(
      (task) => task.status !== "done" && !task.scheduling?.scheduledFor
    );

    const sortedTasks = this.prioritizeTasks(unscheduledTasks);
    const schedule: ScheduleSlot[] = [];
    const currentDate = new Date();

    for (const task of sortedTasks) {
      const slot = this.findOptimalSlot(task, schedule, currentDate);
      if (slot) {
        schedule.push(slot);
      }
    }

    return schedule.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }

  // Prioritize tasks based on multiple factors
  private prioritizeTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      // Factor 1: Deadline urgency
      const aDeadline = a.scheduling?.deadline
        ? new Date(a.scheduling.deadline).getTime()
        : Infinity;
      const bDeadline = b.scheduling?.deadline
        ? new Date(b.scheduling.deadline).getTime()
        : Infinity;
      const deadlineScore = aDeadline - bDeadline;

      // Factor 2: Dependencies (tasks with no dependencies first)
      const aDeps = a.scheduling?.dependencies?.length || 0;
      const bDeps = b.scheduling?.dependencies?.length || 0;
      const depScore = aDeps - bDeps;

      // Factor 3: Priority
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityScore =
        priorityWeight[b.priority] - priorityWeight[a.priority];

      // Factor 4: Energy level match with current time
      const aEnergyScore = this.getEnergyScore(a);
      const bEnergyScore = this.getEnergyScore(b);
      const energyScore = bEnergyScore - aEnergyScore;

      // Combine all factors
      return (
        deadlineScore * 0.4 +
        depScore * 0.2 +
        priorityScore * 0.2 +
        energyScore * 0.2
      );
    });
  }

  // Find optimal time slot for a task
  private findOptimalSlot(
    task: Task,
    existingSchedule: ScheduleSlot[],
    startDate: Date
  ): ScheduleSlot | null {
    const duration = task.scheduling?.estimatedDuration || 60; // default 1 hour
    const energyRequired = task.scheduling?.energyLevel || "medium";
    const requiresFocus = task.scheduling?.developerContext?.focusTime || false;

    // Check dependencies
    if (!this.areDependenciesMet(task, existingSchedule)) {
      return null;
    }

    // Try to find a slot in the next 14 days
    for (let day = 0; day < 14; day++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + day);

      const slot = this.findSlotInDay(
        task,
        currentDay,
        duration,
        energyRequired,
        requiresFocus,
        existingSchedule
      );
      if (slot) {
        return slot;
      }
    }

    return null;
  }

  // Check if task dependencies are satisfied
  private areDependenciesMet(task: Task, schedule: ScheduleSlot[]): boolean {
    if (!task.scheduling?.dependencies?.length) return true;

    const scheduledTaskIds = new Set(schedule.map((slot) => slot.taskId));
    return task.scheduling.dependencies.every((depId) =>
      scheduledTaskIds.has(depId)
    );
  }

  // Find available slot in a specific day
  private findSlotInDay(
    task: Task,
    date: Date,
    duration: number,
    energyRequired: EnergyLevel,
    requiresFocus: boolean,
    existingSchedule: ScheduleSlot[]
  ): ScheduleSlot | null {
    const workStart = this.parseTime(this.developerProfile.workingHours.start);
    const workEnd = this.parseTime(this.developerProfile.workingHours.end);

    const dayStart = new Date(date);
    dayStart.setHours(workStart.hours, workStart.minutes, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(workEnd.hours, workEnd.minutes, 0, 0);

    // Get existing slots for this day
    const daySchedule = existingSchedule.filter((slot) => {
      const slotDate = new Date(slot.startTime);
      return slotDate.toDateString() === date.toDateString();
    });

    // Try different time slots
    const slotDuration = requiresFocus
      ? Math.max(duration, this.developerProfile.focusBlocks.duration)
      : duration;

    for (
      let time = dayStart.getTime();
      time + slotDuration * 60000 <= dayEnd.getTime();
      time += 30 * 60000
    ) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time + slotDuration * 60000);

      // Check if slot is free
      if (
        this.isSlotFree(slotStart, slotEnd, daySchedule) &&
        this.isEnergyLevelSuitable(slotStart, energyRequired)
      ) {
        return {
          id: `slot-${task.id}-${slotStart.getTime()}`,
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          taskId: task.id,
          energyRequired,
          isFlexible: !requiresFocus,
        };
      }
    }

    return null;
  }

  // Check if a time slot is free
  private isSlotFree(
    start: Date,
    end: Date,
    daySchedule: ScheduleSlot[]
  ): boolean {
    return !daySchedule.some((slot) => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      return start < slotEnd && end > slotStart;
    });
  }

  // Check if energy level is suitable for the time
  private isEnergyLevelSuitable(time: Date, required: EnergyLevel): boolean {
    const hour = time.getHours();
    let availableEnergy: EnergyLevel;

    if (hour < 12) {
      availableEnergy = this.developerProfile.energyPattern.morning;
    } else if (hour < 17) {
      availableEnergy = this.developerProfile.energyPattern.afternoon;
    } else {
      availableEnergy = this.developerProfile.energyPattern.evening;
    }

    const energyLevels = { low: 1, medium: 2, high: 3 };
    return energyLevels[availableEnergy] >= energyLevels[required];
  }

  // Get energy score for task prioritization
  private getEnergyScore(task: Task): number {
    const currentHour = new Date().getHours();
    const requiredEnergy = task.scheduling?.energyLevel || "medium";

    let availableEnergy: EnergyLevel;
    if (currentHour < 12) {
      availableEnergy = this.developerProfile.energyPattern.morning;
    } else if (currentHour < 17) {
      availableEnergy = this.developerProfile.energyPattern.afternoon;
    } else {
      availableEnergy = this.developerProfile.energyPattern.evening;
    }

    const energyLevels = { low: 1, medium: 2, high: 3 };
    return energyLevels[availableEnergy] >= energyLevels[requiredEnergy]
      ? 1
      : 0;
  }

  // Parse time string to hours and minutes
  private parseTime(timeStr: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return { hours, minutes };
  }

  // Estimate task duration based on type and complexity
  static estimateTaskDuration(task: Task): number {
    const baseMinutes = {
      coding: 120,
      debugging: 90,
      research: 60,
      documentation: 45,
      testing: 75,
      review: 30,
      meeting: 60,
      planning: 90,
    };

    const complexityMultiplier = {
      simple: 0.7,
      moderate: 1.0,
      complex: 1.5,
    };

    const taskType = task.scheduling?.developerContext?.taskType || "coding";
    const complexity =
      task.scheduling?.developerContext?.complexity || "moderate";

    return Math.round(baseMinutes[taskType] * complexityMultiplier[complexity]);
  }

  // Smart suggestions for task enhancement
  static generateSmartSuggestions(task: Task): string[] {
    const suggestions: string[] = [];
    const context = task.scheduling?.developerContext;

    if (!context?.taskType) {
      suggestions.push(
        "🤖 Consider categorizing this task (coding, debugging, etc.) for better scheduling"
      );
    }

    if (!task.scheduling?.estimatedDuration) {
      const estimated = this.estimateTaskDuration(task);
      suggestions.push(
        `⏱️ Estimated duration: ${estimated} minutes based on task type`
      );
    }

    if (!task.scheduling?.energyLevel) {
      if (context?.complexity === "complex" || context?.focusTime) {
        suggestions.push(
          "⚡ This looks like a high-energy task - schedule during your peak hours"
        );
      }
    }

    if (
      context?.taskType === "coding" &&
      !task.scheduling?.gitIntegration?.repositoryUrl
    ) {
      suggestions.push(
        "🔗 Link to Git repository for automatic completion tracking"
      );
    }

    if (!task.scheduling?.deadline && task.priority === "high") {
      suggestions.push(
        "📅 High priority task detected - consider setting a deadline"
      );
    }

    return suggestions;
  }
}
