import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'user' },
    items: [{
        product: { type: String, required: true, ref: 'user' },
        quantity: {type: Number, required: true}
    }],
        amount: {type: Number, required: true},
        address: {type: String, required: true, ref: 'Address'},
        status: {type: String, default: "Order Placed"},
        paymnetType: {type: String, required: true},
        isPaid: {type: Boolean, requied: true, default: false},

}, { timestamps: true})


const Order = mongoose.models.order || mongoose.model("Order", orderSchema);
export default Order;