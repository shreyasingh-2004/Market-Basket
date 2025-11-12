import Product from "../models/Product.js";
import cloudinary from "../configs/cloudinary.js";

// Add product: /api/product/add
export const addProduct = async (req, res) => {
    try {
        let productData = JSON.parse(req.body.productData || '{}');
        const files = req.files || [];
        let imagesUrls = await Promise.all(
            files.map(async (file) => {
                let result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
                return result.secure_url;
            })
        );
        await Product.create({ ...productData, image: imagesUrls });
        res.json({ success: true, message: "Product added successfully" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get product: /api/product/list
export const productList = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ success: true, products });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get single product: /api/product/id
export const productById = async (req, res) => {
    try {
        const { id } = req.body;
        const product = await Product.findById(id);
        res.json({ success: true, product });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//  change stock: /api/product/stock
export const changeStock = async (req, res) => {
    try {
        const { id, inStock } = req.body;
        const product = await Product.findByIdAndUpdate(id, { inStock});
        res.json({ success: true, message: "Stock updated successfully" })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}