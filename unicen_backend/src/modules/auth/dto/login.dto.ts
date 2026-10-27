import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

/**
 * Credentials payload for login.
 */
export class LoginDto {
  @ApiProperty({ example: "admin@unicen.edu.bo" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "Admin123!" })
  @IsString()
  @IsNotEmpty()
  password: string;
}
