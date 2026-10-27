import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubjectEntity } from "./subject.entity";
import { SubjectsService } from "./subjects.service";
import { SubjectsController } from "./subjects.controller";

/**
 * Module managing academic subjects.
 */
@Module({
  imports: [TypeOrmModule.forFeature([SubjectEntity])],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}
