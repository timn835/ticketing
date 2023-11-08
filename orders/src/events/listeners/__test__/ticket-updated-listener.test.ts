import { TicketUpdatedEvent } from "@timn835tickets/common";
import mongoose from "mongoose";

import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/Ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Concert",
    price: 20,
  });
  await ticket.save();

  // Create a fake data event
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "Different concert",
    price: 21,
    userId: "123",
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, data, msg };
};

it("finds, updates and saves a ticket", async () => {
  const { ticket, listener, data, msg } = await setup();

  // Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.id).toEqual(ticket.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertions to make sure the ack function was called
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version", async () => {
  const { listener, data, msg } = await setup();
  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (error) {
    console.error(error);
  }
  expect(msg.ack).not.toHaveBeenCalled();
});
