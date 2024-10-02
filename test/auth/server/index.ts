import express from 'express';
import cors from 'cors';
const { cookieParser } = require('cookie-parser');

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import webhookRoutes from './routes/webhookRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests
app.use(cookieParser());

// Routes
//app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/webhooks', webhookRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
