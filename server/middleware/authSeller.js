import jwt from 'jsonwebtoken';

const authSeller = (req, res, next) => {
    const sellerToken = req.cookies && req.cookies.sellerToken;

    if (!sellerToken) {
        console.warn('authSeller: no sellerToken cookie present');
        return res.status(401).json({ success: false, message: 'Not authorised: no seller token' });
    }

    try {
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            return res.status(500).json({ success: false, message: 'Server misconfigured: missing JWT secret' });
        }

        let decoded;
        try {
            decoded = jwt.verify(sellerToken, secretKey);
        } catch (err) {
            console.warn('authSeller: token verification failed:', err.message);
            return res.status(401).json({ success: false, message: 'Not authorised: invalid token' });
        }

        if (!decoded || !decoded.email) {
            console.warn('authSeller: token decoded but missing email');
            return res.status(401).json({ success: false, message: 'Not authorised: invalid token' });
        }

        // Attach user info for downstream handlers (do not log token)
        req.user = decoded;
        console.log('authSeller: token verified for email:', decoded.email);
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token verification failed', error: error.message });
    }
}

export default authSeller;