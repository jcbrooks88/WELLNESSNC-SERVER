import dotenv from 'dotenv';
dotenv.config();
export const ENV = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '4000',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    JWT_SECRET: process.env.JWT_SECRET,
    REFRESH_SECRET: process.env.REFRESH_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
};
if (!ENV.JWT_SECRET || !ENV.REFRESH_SECRET) {
    throw new Error('Missing required JWT environment variables');
}
