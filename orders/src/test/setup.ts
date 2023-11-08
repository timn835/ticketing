import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: () => string[];
}

jest.mock("../nats-wrapper.ts");

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

global.signin = () => {
  const payload = {
    //some random sign in values
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  const session = { jwt: jwt.sign(payload, process.env.JWT_KEY!) };
  return [`session=${Buffer.from(JSON.stringify(session)).toString("base64")}`];
};
