import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from "@timn835tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
