import { Grade } from "./grade.entity";

export const GRADE_CALCULATION_STRATEGY = Symbol("GRADE_CALCULATION_STRATEGY");

/**
 * Strategy interface for calculating final course grades.
 */
export interface GradeCalculationStrategy {
  calculate(grades: Grade[]): number;
}

/**
 * Simple arithmetic average calculation strategy.
 */
export class SimpleAverageStrategy implements GradeCalculationStrategy {
  calculate(grades: Grade[]): number {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, g) => acc + g.value, 0);
    return sum / grades.length;
  }
}

/**
 * Weighted average calculation strategy.
 */
export class WeightedAverageStrategy implements GradeCalculationStrategy {
  calculate(grades: Grade[]): number {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, g) => acc + g.value, 0);
    return sum / grades.length;
  }
}
