import jwt from 'jsonwebtoken';
import { ENV } from '../utils/configLoader.js';
const ACCESS_SECRET = process.env.JWT_SECRET;
console.log("JWT_SECRET:", process.env.JWT_SECRET);
if (!ACCESS_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}
export const generateAccessToken = (user) => jwt.sign({ data: { _id: user._id, email: user.email, username: user.username } }, ENV.JWT_SECRET, { expiresIn: '60m' });
export const generateRefreshToken = (user) => jwt.sign({ data: { _id: user._id, email: user.email, username: user.username } }, ENV.REFRESH_SECRET, { expiresIn: '7d' });
