import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();//to get enviorment variables

const app = express();
const port = 5000;

app.use(express.json()); //to read json data
app.use(express.urlencoded({ extended: true})) //for url encoded data, form data

mongoose.connect(process.env.MONGO_URI)
            .then(()=>{
                console.log("connected to database");
                app.listen(port,()=>{console.log(`server is running on port ${port}`)});
            })
            .catch((err)=>{
                console.log("error in connecting to databse cause "+err);
            })


