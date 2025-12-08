import Address from "../models/Address.js";

//  ADD ADDRESS
//  add address: /api/address/add
export const addAddress = async (req, res) => {
    try {
        const userId = req.userId;    // coming from auth middleware
        const address = req.body.address;

        await Address.create({ userId, ...address });

        res.json({ success: true, message: "Address added successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};


//  GET ADDRESS
//  get address: /api/address/get
export const getAddress = async (req, res) => {
    try {
        const userId = req.userId; // must come from token
        const addresses = await Address.find({ userId });

        res.json({ success: true, addresses });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
