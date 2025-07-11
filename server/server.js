import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";
import cron from "node-cron";
import ChallengeService from "./services/ChallengeService.js";

dotenv.config();//to get enviorment variables

const app = express();
const port = 5000;

app.use(express.json()); //to read json data
app.use(express.urlencoded({ extended: true })) //for url encoded data, form data
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // frontend origins allowed
  credentials: true, // if you use cookies or authentication headers
  allowedHeaders: ['Content-Type', 'Authorization'],

}));

// Routes
app.use("/api/auth", authRoutes);

// Schedule daily challenge generation at 12:01 AM every day
cron.schedule('1 0 * * *', async () => {
  try {
    console.log('Running daily challenge generation...');
    await ChallengeService.createTodaysChallenge();
    console.log('Daily challenge generated successfully');
  } catch (error) {
    console.error('Error generating daily challenge:', error);
  }
}, {
  timezone: "America/New_York" // Adjust timezone as needed
});

// Also generate a challenge on server startup if none exists for today
const initializeDailyChallenge = async () => {
  try {
    await ChallengeService.createTodaysChallenge();
    console.log('Daily challenge initialization completed');
  } catch (error) {
    console.error('Error initializing daily challenge:', error);
  }
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connected to database");
    
    // Initialize daily challenge after DB connection
    initializeDailyChallenge();
    
    app.listen(port, () => { 
      console.log(`server is running on port ${port}`);
      console.log('Daily challenge cron job scheduled for 12:01 AM daily');
    });
  })
  .catch((err) => {
    console.log("error in connecting to databse cause " + err);
  })


