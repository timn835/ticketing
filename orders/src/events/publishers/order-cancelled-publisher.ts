import {
  Publisher,
  Subjects,
  OrderCancelledEvent,
} from "@timn835tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
