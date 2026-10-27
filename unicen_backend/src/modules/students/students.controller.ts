import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { StudentsService } from "./students.service";

/**
 * Controller handling student HTTP endpoints.
 */
@ApiTags("Students")
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}
}
