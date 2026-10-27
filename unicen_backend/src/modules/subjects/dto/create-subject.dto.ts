import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";

/**
 * Input payload to create a subject.
 */
export class CreateSubjectDto {
  @ApiProperty({ example: "MAT-101", maxLength: 20 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, {
    message: "El código solo admite letras, números y guiones",
  })
  code: string;

  @ApiProperty({ example: "Cálculo I", maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 20 })
  @IsInt()
  @Min(1)
  @Max(20)
  credits: number;
}
