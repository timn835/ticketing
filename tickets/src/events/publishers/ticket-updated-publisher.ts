import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@timn835tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
