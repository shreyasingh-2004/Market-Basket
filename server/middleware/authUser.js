import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
    // Accept token from cookie (named `token`) or Authorization: Bearer <token>
    const cookieToken = req.cookies && req.cookies.token;
    const authHeader = req.headers && req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
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
        // decoded should contain an `id` set when the token was issued
        if (!decoded || !decoded.id) {
            return res.status(401).json({ success: false, message: 'Not authorised: invalid token' });
        }

        req.body = req.body || {};
        req.body.userId = decoded.id;
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token verification failed', error: error.message });
    }
};

export default authUser;