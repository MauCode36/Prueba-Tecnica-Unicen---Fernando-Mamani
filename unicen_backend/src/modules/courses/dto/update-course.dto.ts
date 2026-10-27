import { PartialType } from "@nestjs/swagger";
import { CreateCourseDto } from "./create-course.dto";

/**
 * Input payload to partially update a course.
 */
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
