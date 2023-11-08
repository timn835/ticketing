import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/Ticket";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 404 if provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "Valid title 1",
      price: 21,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "Valid title 1",
      price: 21,
    })
    .expect(401);
});

it("returns a 401 if the user does not own a ticket", async () => {
  const [title, price] = ["dakdald", 22];
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "daooeowla",
      price: 23,
    })
    .expect(401);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);
  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const [title, price] = ["dakdald", 22];
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title,
      price,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title,
      price: -10,
    })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const [title, price] = ["dakdald", 22];
  const [newTitle, newPrice] = ["dsajdjkf", 26];
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title,
      price,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(200);
});

it("publishes an event", async () => {
  const [title, price] = ["dakdald", 22];
  const [newTitle, newPrice] = ["dsajdjkf", 26];
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title,
      price,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if a ticket is reserved", async () => {
  const [title, price] = ["dakdald", 22];
  const [newTitle, newPrice] = ["dsajdjkf", 26];
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title,
      price,
    });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(400);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
