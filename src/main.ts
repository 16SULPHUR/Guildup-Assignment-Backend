// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import mainRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
// import { AppError } from './utils/AppError.js';

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middlewares
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/v1', mainRouter);

app.get('/', (req, res) => {
  console.log(req.body);
  res.send('Welcome to the Courseify API!');
}); 

// Handle 404 Not Found for any unhandled routes
// app.all('*', (req, next) => {
//     next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

export default app;