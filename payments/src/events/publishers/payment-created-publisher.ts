import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@timn835tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
