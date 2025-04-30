import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { seedDatabase } from './seeds/seedDatabase.js';
import connectDB from './mongoDB/config/connection.js';
import { typeDefs } from './graphql/schemas/index.js';
import { resolvers } from './graphql/resolvers/index.js';
import mongoose from 'mongoose';
import { authenticate } from './utils/auth.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './utils/configLoader.js';
import dotenv from 'dotenv';

dotenv.config();

const app: express.Application = express();
const PORT = ENV.PORT || 4000;

// Enable trust proxy if behind a proxy (e.g., Render)
app.set('trust proxy', 1);

// CORS setup
app.use(cors({
  origin: [
    ENV.FRONTEND_URL || 'http://localhost:5173',
    'https://studio.apollographql.com'
  ],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// Health check route
app.get('/status', (_req: express.Request, res: express.Response) => {
  res.json({ message: '🟢 Server is healthy', uptime: process.uptime() });
});


async function startServer() {
  try {
    await connectDB();
    console.log("✅ MongoDB Ready");

    // Only seed in development
    if (ENV.NODE_ENV !== 'production') {
      console.log("🌱 Seeding database...");
      await seedDatabase();
      console.log("🌱 Database seeding completed");
    }

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      persistedQueries: false,
      context: ({ req, res }) => {
        const user = authenticate(req);
        if (!user) console.warn('No user found in request auth header');
        else console.log('Authenticated user:', user);
        return { req, res, user };
      }
    });

    await server.start();
    server.applyMiddleware({
      app: app as any,
      path: '/graphql',
      cors: false, // Already handled above
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected on app termination');
      process.exit(0);
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Server startup failed: ${error.message}`);
    } else {
      console.error('❌ Server startup failed with an unknown error');
    }
  }
}

startServer();
