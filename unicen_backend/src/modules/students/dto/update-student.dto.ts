import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateStudentDto } from "./create-student.dto";

/**
 * Input payload to partially update a student (the password is not editable here).
 */
export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, ["password"] as const),
) {}
