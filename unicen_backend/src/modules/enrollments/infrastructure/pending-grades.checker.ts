import { Injectable } from "@nestjs/common";
import { EnrollmentGradesChecker } from "../domain/enrollment-grades-checker.port";

/**
 * Interim EnrollmentGradesChecker: the `grades` table does not exist yet, so no
 * enrollment has grades. E4 replaces this binding with an SQL-backed checker.
 */
@Injectable()
export class PendingGradesChecker implements EnrollmentGradesChecker {
  /**
   * Tells whether an enrollment has grades.
   * @returns Always false until grades are implemented.
   */
  hasGrades(): Promise<boolean> {
    return Promise.resolve(false);
  }
}
