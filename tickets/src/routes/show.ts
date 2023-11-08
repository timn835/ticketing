import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@timn835tickets/common";
import { Ticket } from "../models/Ticket";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }
  res.send(ticket);
});

export { router as showTicketRouter };
