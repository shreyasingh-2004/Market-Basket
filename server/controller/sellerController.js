// login seller: /api/seller/login
import jwt from 'jsonwebtoken';

export const sellerLogin = async (req, res) => {
    try {
        console.log('sellerLogin called', req.method, req.originalUrl);
        console.log('sellerLogin body:', req.body);
        const { email, password } = req.body || {};
        // normalize inputs and env values to avoid issues with surrounding quotes/whitespace
        const emailReq = (email || '').toString().trim();
        const passwordReq = (password || '').toString().trim();
        // helper to strip surrounding quotes if present
        const stripQuotes = (s = '') => s.replace(/^\s*["']?(.*?)["']?\s*$/, '$1');
        const sellerEmail = stripQuotes((process.env.SELLER_EMAIL || '').toString()).trim();
        const sellerPassword = stripQuotes((process.env.SELLER_PASSWORD || '').toString()).trim();

        console.log('sellerLogin received email:', emailReq);
        console.log('sellerLogin env email:', sellerEmail ? '[SET]' : '[NOT SET]');

        if (passwordReq === sellerPassword && emailReq === sellerEmail) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });


            res.cookie('sellerToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            return res.json({ success: true, message: 'Seller login successfully' });
        }
        else {
            return res.json({ success: false, message: 'Invalid Seller Credentials' });
        }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//  check seller authority: /api/seller/is-auth
export const isSellerAuth = async (req, res) => {
    try {
        // authSeller middleware attaches decoded token to req.user
        const user = req.user || null;
        return res.json({ success: true, user });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// logout seller: /api/seller/logout
export const sellerLogout = async (req, res) => {
    try {
        res.clearCookie('sellerToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        return res.json({ success: true, message: "Logout sucessfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}