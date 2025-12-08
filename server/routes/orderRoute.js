import express from "express";
import authUser from "../middleware/authUser.js";
import { getAllOrder, getUserOrder, placeOrderCOD, placeOrderStripe } from "../controller/orderController.js";
import authSeller from "../middleware/authSeller.js";

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.get('/user', authUser, getUserOrder);
// legacy/alias route: some clients may request /api/order/my-order
orderRouter.get('/my-order', authUser, getUserOrder);
orderRouter.get('/seller', authSeller, getAllOrder);
orderRouter.post('/stripe', authUser, placeOrderStripe);


export default orderRouter;