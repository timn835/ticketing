import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
} from "@timn835tickets/common";

import { Order, OrderStatus } from "../models/Order";
import { stripe } from "../stripe";
import { Payment } from "../models/Payment";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token").not().isEmpty().withMessage("Invalid payment request"),
    body("orderId").not().isEmpty().withMessage("Invalid payment request"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot for a cancelled or expired order");
    }

    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    // save the payment to the db
    // usefull if we want to show the user a list of all of his orders
    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    await payment.save();

    // Publish a payment created event
    // We do not use the await keyword on purpose, no need to wait in this case
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    // Send the payment id back
    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
