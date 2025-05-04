import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from './configLoader.js';
import { generateAccessToken } from './generateToken.js';
const router = Router();
router.post('/refresh_token', (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
        return res.status(401).json({ ok: false, message: 'No refresh token found' });
    }
    try {
        const payload = jwt.verify(token, ENV.REFRESH_SECRET);
        const accessToken = generateAccessToken(payload.data);
        return res.json({ ok: true, accessToken });
    }
    catch (err) {
        return res.status(403).json({ ok: false, message: 'Invalid or expired refresh token' });
    }
});
export default router;
