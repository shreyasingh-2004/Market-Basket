import Order from "../models/order.js";
import Product from "../models/Product.js";
import stripe from 'stripe';

// place order cod: /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, address } = req.body;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        let amount = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);
            amount += product.offerPrice * item.quantity;
        }

        // Add tax charge(2%)
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: 'COD',
        });

        return res.json({ success: true, message: "Order Placed Successfully" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// place order online: /api/order/stripe
export const placeOrderStripe = async (req, res) => {
    try {
        console.log('placeOrderStripe: called');
        const userId = req.userId;
        const { items, address } = req.body;
        const origin = req.headers.origin || "http://localhost:5173";

        if (!address || !items || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        const TAX_RATE = 0.02; // 2%
        const stripeCurrency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();

        let amount = 0; 
        let productData = [];

        // Calculate amount & prepare product summary
        for (const item of items) {
            const product = await Product.findById(item.product);
            const unitPrice = Number(product.offerPrice || product.price || 0);
            amount += unitPrice * item.quantity;

            productData.push({
                name: product.name,
                price: unitPrice,
                quantity: item.quantity
            });
        }

        // Apply tax precisely and round to 2 decimals (store in main currency units)
        const amountMain = Math.round(amount * (1 + TAX_RATE) * 100) / 100; // e.g. 49.99

        // Create the order first (store amount in main currency units)
        const order = await Order.create({
            userId,
            items,
            amount: amountMain,
            address,
            paymentType: "Online",
        });

        // Stripe Initialization
        const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

        // Create Stripe line_items (unit_amount must be integer in smallest currency unit, e.g. cents)
        const line_items = productData.map((p) => ({
            price_data: {
                currency: stripeCurrency,
                product_data: {
                    name: p.name,
                },
                // convert to smallest currency unit 
                unit_amount: Math.round(p.price * (1 + TAX_RATE) * 100),
            },
            quantity: p.quantity,
        }));

        // Create Stripe Checkout session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-order`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        });

        return res.json({ success: true, url: session.url });

    } catch (error) {
        console.log("Stripe Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// get order: /api/order/user
export const getUserOrder = async (req, res) => {
    try {
        // userId comes from auth middleware
        const userId = req.userId;
        console.log('getUserOrder: userId=', userId);
        const orders = await Order.find({
            userId,
            $or: [{ paymentType: 'COD' }, { isPaid: true }],
        })
            .populate('items.product')
            .populate('address')
            .sort({ createdAt: -1 });

        console.log('getUserOrder: found', orders.length, 'orders');

        res.json({ success: true, orders });

    } catch (error) {
        // console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//  get all order for seller : /api/order/seller


export const getAllOrder = async (req, res) => {
    try {
        console.log('getAllOrder: fetching seller orders...');
        const orders = await Order.find({
            $or: [{ paymentType: 'COD' }, { isPaid: true }],
        })
            .populate('items.product')
            .populate('address')
            .sort({ createdAt: -1 });

        console.log('getAllOrder: found', orders.length, 'orders');
        res.json({ success: true, orders });

    } catch (error) {
        console.log('getAllOrder error:', error.message);
        res.json({ success: false, message: error.message });
    }
}