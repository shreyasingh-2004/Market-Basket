import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
    // Accept token from cookie (named `token`) or Authorization: Bearer <token>
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers?.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    const token = cookieToken || bearerToken;

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorised: token missing" });
    }

    try {
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            console.error('JWT_SECRET is not set');
            return res.status(500).json({ success: false, message: 'Server configuration error: JWT_SECRET is not set' });
        }

        const decoded = jwt.verify(token, secretKey);

        if (!decoded?.id) {
            return res.status(401).json({ success: false, message: 'Not authorised: invalid token' });
        }

        // Store userId here (NOT inside req.body)
        req.userId = decoded.id;
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token verification failed', error: error.message });
    }
};

export default authUser;
