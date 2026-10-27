import { EnrollmentStatus } from "../domain/enrollment-status.enum";
import { EnrollmentRepository } from "../domain/enrollment.repository";
import { StudentDirectory } from "../domain/student-directory.port";
import { ListMyEnrollmentsUseCase } from "./list-my-enrollments.use-case";

describe("ListMyEnrollmentsUseCase", () => {
  let repository: { findSummaries: jest.Mock };
  let directory: { findByUserId: jest.Mock };
  let useCase: ListMyEnrollmentsUseCase;

  beforeEach(() => {
    repository = { findSummaries: jest.fn().mockResolvedValue([]) };
    directory = {
      findByUserId: jest.fn().mockResolvedValue({ id: "s1", isActive: true }),
    };
    useCase = new ListMyEnrollmentsUseCase(
      repository as unknown as EnrollmentRepository,
      directory as unknown as StudentDirectory,
    );
  });

  it("returns active enrollments filtered by term", async () => {
    await useCase.execute({ userId: "u1", term: "2026-2" });

    expect(repository.findSummaries).toHaveBeenCalledWith({
      studentId: "s1",
      term: "2026-2",
      status: EnrollmentStatus.ACTIVE,
    });
  });

  it("returns an empty list when the user has no student profile", async () => {
    directory.findByUserId.mockResolvedValue(null);

    await expect(useCase.execute({ userId: "u9" })).resolves.toEqual([]);
    expect(repository.findSummaries).not.toHaveBeenCalled();
  });
});
