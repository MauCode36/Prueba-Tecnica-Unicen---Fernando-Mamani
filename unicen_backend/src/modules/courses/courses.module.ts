import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubjectsModule } from "../subjects/subjects.module";
import { UsersModule } from "../users/users.module";
import { CourseEntity } from "./course.entity";
import { CoursesController } from "./courses.controller";
import { CoursesQueryBuilder } from "./courses-query.builder";
import { CoursesService } from "./courses.service";

/**
 * Module managing courses.
 */
@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity]), SubjectsModule, UsersModule],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesQueryBuilder],
  exports: [CoursesService],
})
export class CoursesModule {}
