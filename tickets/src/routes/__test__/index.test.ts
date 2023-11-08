import request from "supertest";

import { app } from "../../app";

const createTicket = (title: string, price: number) => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title, price });
};

it("can fetch a list of tickets", async () => {
  await createTicket("Concert", 15);
  await createTicket("Waterslide", 20);
  await createTicket("Hockey game", 25);

  const response = await request(app)
    .get("/api/tickets")
    .set("Cookie", global.signin())
    .send()
    .expect(200);

  expect(response.body.length).toEqual(3);
});
