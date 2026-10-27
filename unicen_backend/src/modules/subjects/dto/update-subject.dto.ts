import { PartialType } from "@nestjs/swagger";
import { CreateSubjectDto } from "./create-subject.dto";

/**
 * Input payload to partially update a subject.
 */
export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}
