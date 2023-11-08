import { Listener, Subjects, OrderCreatedEvent } from "@timn835tickets/common";
import { Message } from "node-nats-streaming";

import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/Order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      status: data.status,
      version: data.version,
      userId: data.userId,
      price: data.ticket.price,
    });
    await order.save();

    msg.ack();
  }
}
