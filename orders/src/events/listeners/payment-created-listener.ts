import {
  Listener,
  Subjects,
  PaymentCreatedEvent,
} from "@timn835tickets/common";
import { Message } from "node-nats-streaming";

import { queueGroupName } from "./queue-group-name";
import { Order, OrderStatus } from "../../models/Order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatus.Complete });
    await order.save();
    // Once an order goes into complete status, no more further steps or updates
    // Hence, we do not need to emit an order update event (no more future updates)

    msg.ack();
  }
}
