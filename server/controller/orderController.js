import Order from "../models/order.js";

// place order cod: /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, address } = req.body;
        if (!address || items.length === 0) {
            return res.json({ success: true, message: "Invalid data" });
        }
        let amount = await items.reduce(async (acc, item) => {
            const product = await product.findById(item.product);
            return (await acc) + product.offerPrice * item.quality;
        }, 0)

        // Add tax  charge(2%)
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
}

// get order: /api/order/user

export const getUserOrder = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await Order.find({
            userId,
            $or: [{ paymentType: 'COD' }, { isPaid: true }],

        }).populate("item.product.address").sort({ createdAt: -1 });
        res.json({ success: true, orders })

    } catch (error) {
        // console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//  get all order for seller : /api/order/seller


export const getAllOrder = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: 'COD' }, { isPaid: true }],

        }).populate("item.product.address").sort({ createdAt: -1 });
        res.json({ success: true, orders })

    } catch (error) {
        // console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}