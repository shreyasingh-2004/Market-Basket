import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = () => {
    // Read raw env values (may contain surrounding quotes or whitespace)
    const rawName = process.env.CLOUDINARY_NAME;
    const rawKey = process.env.CLOUDINARY_API_KEY;
    const rawSecret = process.env.CLOUDINARY_API_SECRET;

    // Normalize: trim and remove surrounding single/double quotes
    const strip = (s) => s ? s.toString().trim().replace(/^['"]+|['"]+$/g, '') : '';
    const name = strip(rawName);
    const key = strip(rawKey);
    const secret = strip(rawSecret);

    if (!name || !key || !secret) {
        console.warn('connectCloudinary: Missing Cloudinary env values. Uploads will fail. Check .env keys (CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).');
        return;
    }

    // Configure cloudinary with normalized values (do not log secrets)
    cloudinary.config({
        cloud_name: name,
        api_key: key,
        api_secret: secret,
    });
    console.log('connectCloudinary: configured successfully');
}

// export the configured cloudinary instance as default, and the connect function named
export default cloudinary;
export { connectCloudinary };