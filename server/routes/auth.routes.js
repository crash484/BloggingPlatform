import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();
dotenv.config();
const key = process.env.SECRET_KEY;

router.post("/register", async (req,res)=>{
    try{
        const {name,email,password} = req.body;

        //check if user with email already exists or not
        const alreadyExists = await User.findOne({email});

        if( alreadyExists ) return res.status(403).json({message: "user with email already exists"});
        

        const hashed = await bcrypt.hash(password, 10);

        const user = new User({ username: name,email, password:hashed});
        
        const result = await user.save();
        
        if (result) return res.status(200).json({message: "User is successfully registered"});
        else return res.status(403).json({message:"unable to register user"});

    } catch( err ){
        console.log("error in registering ",err.message);//remove in production
        return res.status(500).json({ message: "internal server error"});
    }
})

router.post("/login", async (req,res)=>{
    try{
        const {email,password} = req.body;
        //implement jwt verification when able to send and recieve jwt
        const user = await User.findOne({email});

        if( !user ) return res.status(401).json({message: "user with email doesnt exists"});

        const isMatch = await bcrypt.compare(password, user.password);

        if( isMatch ) {
            // Create a clean payload without sensitive data
            const payload = {
                id: user._id,
                email: user.email,
                username: user.username
            };

            jwt.sign(payload, key, {expiresIn:'1h'}, (err, token) => {
                if(err) {
                    console.log("JWT signing error:", err);
                    return res.status(500).json({message: "Error generating token"});
                }

                return res.status(200).json({
                    token: token,
                    name: user.username,
                    message: "successfully logged in"
                });
            });
        } else {
            return res.status(401).json({message: "invalid password"});
        }
    }catch (err) {
        console.log("error in login backend ",err.message);
        return res.status(500).json({ message: "internal server error"});
    }
})

router.post('/verify',verifyToken,(req,res)=>{ 
    res.json({message:"user is verified"})
  });


export default router;