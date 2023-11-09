import express from "express";
import "express-async-errors"; //this is a hack to not use next function when throwing errors
import { json } from "body-parser";
import cookieSession from "cookie-session";
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from "@timn835tickets/common";

import { createOrderRouter } from "./routes/new";
import { indexOrderRouter } from "./routes";
import { deleteOrderRouter } from "./routes/delete";
import { showOrderRouter } from "./routes/show";

const app = express();
app.set("trust proxy", true); //to allow secure cookies
app.use(json());
app.use(
  cookieSession({
    //disable encryption inside the cookie, as the jwt is already encrypted
    signed: false,
    // secure: process.env.NODE_ENV !== "test", //true if https required
    secure: false,
  })
);
app.use(currentUser);

app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
