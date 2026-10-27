import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SubjectsService } from "./subjects.service";

/**
 * Controller handling subject HTTP endpoints.
 */
@ApiTags("Subjects")
@Controller("subjects")
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}
}
