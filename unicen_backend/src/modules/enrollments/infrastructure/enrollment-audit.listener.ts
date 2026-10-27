import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
  ENROLLMENT_CANCELLED,
  EnrollmentCancelledEvent,
} from "../domain/events/enrollment-cancelled.event";
import {
  ENROLLMENT_CREATED,
  EnrollmentCreatedEvent,
} from "../domain/events/enrollment-created.event";

/**
 * Audit listener logging enrollment events. Holds no business rules (BD-007).
 */
@Injectable()
export class EnrollmentAuditListener {
  private readonly logger = new Logger("Audit");

  /**
   * Logs a created enrollment.
   * @param event - The enrollment.created event.
   */
  @OnEvent(ENROLLMENT_CREATED)
  onCreated(event: EnrollmentCreatedEvent): void {
    this.logger.log(
      `[audit] ${ENROLLMENT_CREATED} enrollmentId=${event.enrollmentId} studentId=${event.studentId} courseId=${event.courseId}`,
    );
  }

  /**
   * Logs a cancelled enrollment.
   * @param event - The enrollment.cancelled event.
   */
  @OnEvent(ENROLLMENT_CANCELLED)
  onCancelled(event: EnrollmentCancelledEvent): void {
    this.logger.log(
      `[audit] ${ENROLLMENT_CANCELLED} enrollmentId=${event.enrollmentId} studentId=${event.studentId} courseId=${event.courseId}`,
    );
  }
}
