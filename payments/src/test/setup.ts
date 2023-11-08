import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: (id?: string) => string[];
}

jest.mock("../nats-wrapper.ts");

process.env.STRIPE_KEY =
  "sk_test_51O9sFUBssXQJ3nmhaqeH4E9GpH8fLvAHt2d458POHKVysAwlml5sagoxxEVQJa79OA3HBJmAw9AmudvA90xxzRUr003sAaoqbM";

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "dsakdkallfa";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  const session = { jwt: jwt.sign(payload, process.env.JWT_KEY!) };
  return [`session=${Buffer.from(JSON.stringify(session)).toString("base64")}`];
};
