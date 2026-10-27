import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, Not, Repository } from "typeorm";
import { AuthenticatedUser } from "../../shared/decorators/current-user.decorator";
import { Role } from "../../shared/enums/role.enum";
import {
  CapacityBelowEnrollmentError,
  CourseHasEnrollmentsError,
  DuplicateCourseError,
  ForbiddenActionError,
  InvalidCourseTeacherError,
  NotFoundError,
} from "../../shared/errors";
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "../../shared/utils/postgres-error.utils";
import { SubjectsService } from "../subjects/subjects.service";
import { UsersService } from "../users/users.service";
import { CourseView } from "./course-view.type";
import { CourseEntity } from "./course.entity";
import { CoursesQueryBuilder } from "./courses-query.builder";
import { CourseResponseDto } from "./dto/course-response.dto";
import { CreateCourseDto } from "./dto/create-course.dto";
import { EnrolledStudentResponseDto } from "./dto/enrolled-student-response.dto";
import { ListCoursesQueryDto } from "./dto/list-courses-query.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";

/**
 * Service managing course operations.
 */
@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    private readonly dataSource: DataSource,
    private readonly queryBuilder: CoursesQueryBuilder,
    private readonly subjectsService: SubjectsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Creates a course offering.
   * @param dto - Course data.
   * @returns The created course with seat counts.
   * @throws {NotFoundError} When the subject or teacher does not exist.
   * @throws {InvalidCourseTeacherError} When the user is not an active teacher.
   * @throws {DuplicateCourseError} When (subject, term, section) already exists.
   */
  async create(dto: CreateCourseDto): Promise<CourseResponseDto> {
    if (!(await this.subjectsService.findEntityById(dto.subjectId))) {
      throw new NotFoundError("Materia no encontrada");
    }
    await this.assertTeacher(dto.teacherId);
    if (
      await this.courseRepository.existsBy({
        subjectId: dto.subjectId,
        term: dto.term,
        section: dto.section,
      })
    ) {
      throw new DuplicateCourseError();
    }
    try {
      const saved = await this.courseRepository.save(
        this.courseRepository.create(dto),
      );
      return this.findOneOrFail(saved.id);
    } catch (err) {
      if (isUniqueViolation(err)) throw new DuplicateCourseError();
      throw err;
    }
  }

  /**
   * Lists the course offering with seat availability.
   * @param query - Optional term and subject filters.
   * @param viewer - Authenticated user; `isEnrolled` is resolved for students.
   * @returns The matching courses.
   */
  async findAll(
    query: ListCoursesQueryDto,
    viewer: AuthenticatedUser,
  ): Promise<CourseResponseDto[]> {
    const views = await this.queryBuilder.findMany(
      query,
      this.viewerUserId(viewer),
    );
    return views.map((view) => CourseResponseDto.fromView(view));
  }

  /**
   * Lists the courses assigned to a teacher.
   * @param teacherId - Teacher user id.
   * @returns The teacher's courses.
   */
  async findMine(teacherId: string): Promise<CourseResponseDto[]> {
    const views = await this.queryBuilder.findMany({ teacherId });
    return views.map((view) => CourseResponseDto.fromView(view));
  }

  /**
   * Finds a course with seat counts.
   * @param id - Course UUID.
   * @param viewer - Authenticated user.
   * @returns The course.
   * @throws {NotFoundError} When the course does not exist.
   */
  findOne(id: string, viewer: AuthenticatedUser): Promise<CourseResponseDto> {
    return this.findOneOrFail(id, this.viewerUserId(viewer));
  }

  /**
   * Updates a course under a row lock so it cannot race with an enrollment.
   * @param id - Course UUID.
   * @param dto - Fields to change.
   * @returns The updated course.
   * @throws {NotFoundError} When the course, subject or teacher does not exist.
   * @throws {InvalidCourseTeacherError} When the new teacher is not an active teacher.
   * @throws {DuplicateCourseError} When the new (subject, term, section) exists.
   * @throws {CapacityBelowEnrollmentError} When capacity is below active enrollments.
   */
  async update(id: string, dto: UpdateCourseDto): Promise<CourseResponseDto> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const course = await manager.findOne(CourseEntity, {
          where: { id },
          lock: { mode: "pessimistic_write" },
        });
        if (!course) throw new NotFoundError("Curso no encontrado");
        await this.validateChanges(manager, course, dto);
        Object.assign(course, dto);
        await manager.save(course);
      });
    } catch (err) {
      if (isUniqueViolation(err)) throw new DuplicateCourseError();
      throw err;
    }
    return this.findOneOrFail(id);
  }

  /**
   * Deletes a course without enrollments.
   * @param id - Course UUID.
   * @throws {NotFoundError} When the course does not exist.
   * @throws {CourseHasEnrollmentsError} When the course has enrollments.
   */
  async remove(id: string): Promise<void> {
    if (!(await this.courseRepository.existsBy({ id }))) {
      throw new NotFoundError("Curso no encontrado");
    }
    try {
      await this.courseRepository.delete(id);
    } catch (err) {
      if (isForeignKeyViolation(err)) throw new CourseHasEnrollmentsError();
      throw err;
    }
  }

  /**
   * Lists the students enrolled in a course.
   * @param id - Course UUID.
   * @param viewer - Authenticated user (ADMIN or the course teacher).
   * @returns The enrolled students.
   * @throws {NotFoundError} When the course does not exist.
   * @throws {ForbiddenActionError} When the viewer is not the course teacher nor ADMIN.
   */
  async findEnrolledStudents(
    id: string,
    viewer: AuthenticatedUser,
  ): Promise<EnrolledStudentResponseDto[]> {
    const course = await this.findEntityById(id);
    if (!course) throw new NotFoundError("Curso no encontrado");
    if (viewer.role !== Role.ADMIN && course.teacherId !== viewer.id) {
      throw new ForbiddenActionError(
        "Solo el docente del curso puede ver sus inscritos",
      );
    }
    const students = await this.queryBuilder.findEnrolledStudents(id);
    return students.map((view) => EnrolledStudentResponseDto.fromView(view));
  }

  /**
   * Finds a course entity by id, for use by other modules (enrollments).
   * @param id - Course UUID.
   * @returns The course entity or null.
   */
  findEntityById(id: string): Promise<CourseEntity | null> {
    return this.courseRepository.findOne({ where: { id } });
  }

  private viewerUserId(viewer: AuthenticatedUser): string | undefined {
    return viewer.role === Role.STUDENT ? viewer.id : undefined;
  }

  private async findOneOrFail(
    id: string,
    viewerUserId?: string,
  ): Promise<CourseResponseDto> {
    const view: CourseView | null = await this.queryBuilder.findOneView(
      id,
      viewerUserId,
    );
    if (!view) throw new NotFoundError("Curso no encontrado");
    return CourseResponseDto.fromView(view);
  }

  private async validateChanges(
    manager: EntityManager,
    course: CourseEntity,
    dto: UpdateCourseDto,
  ): Promise<void> {
    if (dto.subjectId && dto.subjectId !== course.subjectId) {
      if (!(await this.subjectsService.findEntityById(dto.subjectId))) {
        throw new NotFoundError("Materia no encontrada");
      }
    }
    if (dto.teacherId && dto.teacherId !== course.teacherId) {
      await this.assertTeacher(dto.teacherId);
    }
    const subjectId = dto.subjectId ?? course.subjectId;
    const term = dto.term ?? course.term;
    const section = dto.section ?? course.section;
    const keyChanged =
      subjectId !== course.subjectId ||
      term !== course.term ||
      section !== course.section;
    if (
      keyChanged &&
      (await manager.existsBy(CourseEntity, {
        subjectId,
        term,
        section,
        id: Not(course.id),
      }))
    ) {
      throw new DuplicateCourseError();
    }
    if (dto.maxCapacity !== undefined) {
      const enrolled = await this.queryBuilder.countActiveEnrollments(
        course.id,
        manager,
      );
      if (dto.maxCapacity < enrolled) {
        throw new CapacityBelowEnrollmentError(enrolled);
      }
    }
  }

  private async assertTeacher(teacherId: string): Promise<void> {
    const teacher = await this.usersService.findById(teacherId);
    if (!teacher) throw new NotFoundError("Docente no encontrado");
    if (teacher.role !== Role.TEACHER || !teacher.isActive) {
      throw new InvalidCourseTeacherError();
    }
  }
}
