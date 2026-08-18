import Product from "../models/Product.js";
import cloudinary from "../configs/cloudinary.js";

// Add product: /api/product/add
export const addProduct = async (req, res) => {
    try {
        const productData = JSON.parse(req.body.productData || '{}');
            // Ensure description is an array so schema validation won't fail
            if (!productData.description) productData.description = [];
        const files = req.files || [];

        const name = productData.name?.toString().trim();
        const category = productData.category?.toString().trim();
        const descriptionText = productData.description?.toString().trim();
        const price = Number(productData.price);
        const offerPrice = Number(productData.offerPrice);

        if (!name || !category || !Number.isFinite(price) || !Number.isFinite(offerPrice)) {
            return res.status(400).json({ success: false, message: "Please fill all required product details correctly" });
        }

        if (files.length === 0) {
            return res.status(400).json({ success: false, message: "Please upload at least one product image" });
        }

        const cloudinaryConfig = cloudinary.config();
        if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
            return res.status(500).json({ success: false, message: "Cloudinary is not configured correctly" });
        }

        const imagesUrls = await Promise.all(
            files.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
                return result.secure_url;
            })
        );

        const description = (descriptionText || '')
            .split(/\r?\n|,/) 
            .map((item) => item.trim())
            .filter(Boolean);

        await Product.create({
            name,
            description,
            category,
            price,
            offerPrice,
            image: imagesUrls,
        });

        res.json({ success: true, message: "Product added successfully" });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
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
