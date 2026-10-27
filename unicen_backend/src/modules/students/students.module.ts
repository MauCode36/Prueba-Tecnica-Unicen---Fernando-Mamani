import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { StudentEntity } from "./student.entity";
import { StudentsController } from "./students.controller";
import { StudentsService } from "./students.service";

/**
 * Module managing students.
 */
@Module({
  imports: [TypeOrmModule.forFeature([StudentEntity]), UsersModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
