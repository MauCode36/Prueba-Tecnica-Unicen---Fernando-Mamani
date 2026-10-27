import { CourseView } from "../course-view.type";
import { CourseResponseDto } from "./course-response.dto";

function buildView(maxCapacity: number, enrolledCount: number): CourseView {
  return {
    id: "c1",
    term: "2026-2",
    section: "A",
    maxCapacity,
    enrolledCount,
    isEnrolled: false,
    subject: { id: "s1", code: "MAT-101", name: "Cálculo I", credits: 5 },
    teacher: { id: "t1", name: "Dr. Mendoza" },
  };
}

describe("CourseResponseDto", () => {
  it("computes availableSeats as maxCapacity minus enrolledCount, never negative", () => {
    expect(CourseResponseDto.fromView(buildView(30, 12)).availableSeats).toBe(18);
    expect(CourseResponseDto.fromView(buildView(2, 5)).availableSeats).toBe(0);
  });
});
