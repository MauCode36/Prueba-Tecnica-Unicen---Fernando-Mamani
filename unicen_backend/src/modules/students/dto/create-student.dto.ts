import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

const trimLower = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toLowerCase() : value;
const trimUpper = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

/**
 * Input payload to register a student (user account + academic profile).
 */
export class CreateStudentDto {
  @ApiProperty({ example: "Luis Fernando Quispe" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: "estudiante2@unicen.edu.bo" })
  @Transform(trimLower)
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: "Student123!", minLength: 6, maxLength: 72 })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password: string;

  @ApiProperty({ example: "S-2026002", maxLength: 20 })
  @Transform(trimUpper)
  @Matches(/^[A-Z0-9-]+$/, {
    message: "El código solo admite letras, números y guiones",
  })
  @MaxLength(20)
  studentCode: string;

  @ApiProperty({ example: "Ingeniería de Sistemas", maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  program: string;
}
