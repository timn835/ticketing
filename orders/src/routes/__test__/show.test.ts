import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/Ticket";

it("fetches the order", async () => {
  const userOne = global.signin();
  const userTwo = global.signin();

  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  //check invalid id
  await request(app)
    .get(`/api/orders/${123}`)
    .set("Cookie", userTwo)
    .send()
    .expect(400);

  //check incorrect id
  const wrongId = new mongoose.Types.ObjectId();
  await request(app)
    .get(`/api/orders/${wrongId}`)
    .set("Cookie", userTwo)
    .send()
    .expect(404);

  //check unauthorized
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", userTwo)
    .send()
    .expect(401);

  //check valid request
  const { body: checkOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", userOne)
    .send()
    .expect(200);
  expect(order).toEqual(checkOrder);
});
