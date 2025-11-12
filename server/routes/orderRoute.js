import express from "express";
import authUser from "../middleware/authUser.js";
import { getAllOrder, getUserOrder, placeOrderCOD } from "../controller/orderController.js";
import authSeller from "../middleware/authSeller.js";

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.get('/user', authUser, getUserOrder);
orderRouter.get('/seller', authSeller, getAllOrder);

export default orderRouter;
