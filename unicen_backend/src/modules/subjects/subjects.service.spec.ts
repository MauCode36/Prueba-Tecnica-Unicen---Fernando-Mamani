import { QueryFailedError, Repository } from "typeorm";
import {
  DuplicateSubjectCodeError,
  NotFoundError,
  SubjectInUseError,
} from "../../shared/errors";
import { SubjectEntity } from "./subject.entity";
import { SubjectsService } from "./subjects.service";

function pgError(code: string): QueryFailedError {
  return new QueryFailedError("query", [], Object.assign(new Error(), { code }));
}

describe("SubjectsService", () => {
  let repository: {
    existsBy: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let service: SubjectsService;
  const existing = { id: "s1", code: "MAT-101", name: "Cálculo I", credits: 5 };

  beforeEach(() => {
    repository = {
      existsBy: jest.fn().mockResolvedValue(false),
      findOne: jest.fn().mockResolvedValue({ ...existing }),
      find: jest.fn(),
      create: jest.fn((data: Partial<SubjectEntity>) => data),
      save: jest.fn((data: Partial<SubjectEntity>) =>
        Promise.resolve({ id: "s1", createdAt: new Date(), ...data }),
      ),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    service = new SubjectsService(
      repository as unknown as Repository<SubjectEntity>,
    );
  });

  it("creates a subject and returns SubjectResponseDto", async () => {
    const result = await service.create({
      code: "FIS-101",
      name: " Física I ",
      credits: 5,
    });

    expect(result.id).toBe("s1");
    expect(result.name).toBe("Física I");
    expect(result).not.toHaveProperty("updatedAt");
  });

  it("throws DuplicateSubjectCodeError when code already exists", async () => {
    repository.existsBy.mockResolvedValue(true);

    await expect(
      service.create({ code: "MAT-101", name: "X", credits: 3 }),
    ).rejects.toBeInstanceOf(DuplicateSubjectCodeError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("throws DuplicateSubjectCodeError on a unique violation race", async () => {
    repository.save.mockRejectedValue(pgError("23505"));

    await expect(
      service.create({ code: "NEW-1", name: "X", credits: 3 }),
    ).rejects.toBeInstanceOf(DuplicateSubjectCodeError);
  });

  it("throws DuplicateSubjectCodeError when updating to a code used by another subject", async () => {
    repository.existsBy.mockResolvedValue(true);

    await expect(
      service.update("s1", { code: "FIS-101" }),
    ).rejects.toBeInstanceOf(DuplicateSubjectCodeError);
  });

  it("throws NotFoundError when subject does not exist", async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne("nope")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("deletes a subject without courses", async () => {
    await service.remove("s1");

    expect(repository.delete).toHaveBeenCalledWith("s1");
  });

  it("throws SubjectInUseError when deleting a subject with courses (FK 23503)", async () => {
    repository.delete.mockRejectedValue(pgError("23503"));

    await expect(service.remove("s1")).rejects.toBeInstanceOf(SubjectInUseError);
  });
});
