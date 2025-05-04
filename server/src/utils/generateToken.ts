import jwt from 'jsonwebtoken';
import { ENV } from '../utils/configLoader.js';

const { JWT_SECRET, REFRESH_SECRET } = ENV;

if (!JWT_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT_SECRET or REFRESH_SECRET is not defined in environment variables');
}

const getUserPayload = (user: any) => ({
  _id: user._id,
  email: user.email,
  username: user.username,
});

export const generateAccessToken = (user: any) =>
  jwt.sign({ data: getUserPayload(user) }, JWT_SECRET, { expiresIn: '15m' });

export const generateRefreshToken = (user: any) =>
  jwt.sign({ data: getUserPayload(user) }, REFRESH_SECRET, { expiresIn: '7d' });
