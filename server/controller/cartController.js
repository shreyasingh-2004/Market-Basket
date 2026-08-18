// update cart: /api/cart/update

import User from "../models/User.js";

export const updateCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { cartItems } = req.body;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authorised" });
        }
        await User.findByIdAndUpdate(userId, { cartItems });
        res.json ({ success: true, message: "Cart Updated Successfully"});

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
