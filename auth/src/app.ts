import express from "express";
import "express-async-errors"; //this is a hack to not use next function when throwing errors
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError } from "@timn835tickets/common";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

const app = express();
app.set("trust proxy", true); //to allow secure cookies
app.use(json());
app.use(
  cookieSession({
    //disable encryption inside the cookie, as the jwt is already encrypted
    signed: false,
    secure: process.env.NODE_ENV !== "test", //true if https required
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
