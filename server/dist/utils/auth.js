import jwt from 'jsonwebtoken';
export const authenticate = (req) => {
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
        console.warn('No token provided.');
        return null;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.data;
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.warn('Token has expired.');
        }
        else {
            console.error('JWT verification failed:', err.message);
        }
        return null;
    }
};
// ⚠️ Only use this in a frontend environment!
export const clearToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};
