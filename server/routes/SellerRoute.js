import express from 'express';
import { isSellerAuth, sellerLogin, sellerLogout } from '../controller/sellerController.js';
import authSeller from '../middleware/authSeller.js';

const sellerRouter = express.Router();
sellerRouter.get('/is-auth',authSeller, isSellerAuth);
sellerRouter.post('/login', sellerLogin); 
sellerRouter.get('/logout', sellerLogout);

export default sellerRouter;
