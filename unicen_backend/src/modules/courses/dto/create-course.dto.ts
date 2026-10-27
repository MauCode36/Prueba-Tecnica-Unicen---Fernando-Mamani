import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";

/** Regex for academic terms such as `2026-2`. */
export const TERM_REGEX = /^\d{4}-[12]$/;

/** Validation message for malformed terms. */
export const TERM_MESSAGE = "La gestión debe tener el formato AAAA-1 o AAAA-2";

/**
 * Input payload to create a course offering.
 */
export class CreateCourseDto {
  @ApiProperty()
  @IsUUID()
  subjectId: string;

  @ApiProperty()
  @IsUUID()
  teacherId: string;

  @ApiProperty({ example: "2026-2" })
  @Matches(TERM_REGEX, { message: TERM_MESSAGE })
  term: string;

  @ApiProperty({ example: "A", maxLength: 10 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  section: string;

  @ApiProperty({ example: 30, minimum: 1, maximum: 500 })
  @IsInt()
  @Min(1)
  @Max(500)
  maxCapacity: number;
}
