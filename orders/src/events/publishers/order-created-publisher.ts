import { Publisher, Subjects, OrderCreatedEvent } from "@timn835tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
