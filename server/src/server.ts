import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { seedDatabase } from "./seeds/seedDatabase.js";
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


// CORS setup
app.use(cors({
  origin: [
    ENV.FRONTEND_URL || 'http://localhost:5173',
    'https://studio.apollographql.com'
  ],
  credentials: true,
}));

app.use(cookieParser()); // 👈 Middleware to parse cookies
app.use(express.json());

// Health check route
app.get('/status', (_req, res) => {
  res.json({ message: '🟢 Server is healthy', uptime: process.uptime() });
});

async function startServer() {
  try {
    await connectDB();
    console.log("✅ MongoDB Ready");
    console.log("🌱 Seeding database...");
    await seedDatabase();
    console.log("🌱 Database seeding completed");

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
      app,
      path: '/graphql',
      cors: false, // <- Important since we handle CORS above
    });

    if (process.env.NODE_ENV === 'production') {
      console.log('Production mode detected.');
      // ⚠️ Comment this in real deployment
      // await mongoose.connection.dropDatabase();
      // logger.warn('⚠️ Database was dropped in production.');
    }

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
    });

    process.on('SIGINT', async () => {
      await mongoose.disconnect();
      console.log('MongoDB disconnected on app termination');
      process.exit(0);
    });

  } catch (error) {
    if (error instanceof Error) {
      console.log(`Server startup failed: ${error.message}`);
    } else {
      console.log('Server startup failed with an unknown error');
    }
  }
}

startServer();
