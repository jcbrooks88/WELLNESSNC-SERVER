import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { seedDatabase } from './seeds/seedDatabase.js';
import connectDB from './mongoDB/config/connection.js';
import { typeDefs } from './graphql/schemas/index.js';
import { resolvers } from './graphql/resolvers/index.js';
import mongoose from 'mongoose';
import { authenticate } from './utils/auth.js';
import refreshTokenRoute from './utils/refreshToken.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './utils/configLoader.js';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
dotenv.config();
const app = express();
// Use Render-assigned port or fallback
const PORT = parseInt(process.env.PORT || ENV.PORT || '4000', 10);
// ----- Middleware -----
app.use(cors({
    origin: [
        ENV.FRONTEND_URL || 'http://localhost:5173',
        'https://studio.apollographql.com',
    ],
    credentials: true,
}));
app.use(express.json());
app.use((req, res, next) => cookieParser()(req, res, next));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/auth', refreshTokenRoute);
// ----- Health check -----
app.get('/status', (_req, res) => {
    res.json({ message: '🟢 Server is healthy', uptime: process.uptime() });
});
// ----- Start Server -----
async function startServer() {
    try {
        await connectDB();
        console.log('✅ MongoDB Ready');
        console.log('🌱 Seeding database...');
        await seedDatabase();
        console.log('🌱 Database seeding completed');
        const apolloServer = new ApolloServer({
            typeDefs,
            resolvers,
        });
        await apolloServer.start();
        app.use('/graphql', expressMiddleware(apolloServer, {
            context: async ({ req, res }) => {
                const user = authenticate(req);
                if (!user) {
                    console.warn('No user found in request auth header');
                }
                else {
                    console.log('Authenticated user:', user);
                }
                return { req, res, user };
            },
        }));
        if (process.env.NODE_ENV === 'production') {
            console.log('🚀 Production mode detected. Server is running...');
        }
        app.listen(PORT, () => {
            console.log(`🚀 Server ready on port ${PORT} — GraphQL at /graphql`);
        });
        process.on('SIGINT', async () => {
            await mongoose.disconnect();
            console.log('MongoDB disconnected on app termination');
            process.exit(0);
        });
    }
    catch (error) {
        const err = error;
        console.error(`Server startup failed: ${err.message}`);
    }
}
startServer();
