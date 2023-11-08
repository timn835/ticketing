import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@timn835tickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
