import { authenticate } from '../utils/auth.js';
export const context = ({ req, res }) => {
    if (!req || !req.headers) {
        console.warn("No request object found in context");
        return { req, res, user: null };
    }
    const user = authenticate(req);
    return { req, res, user };
};
