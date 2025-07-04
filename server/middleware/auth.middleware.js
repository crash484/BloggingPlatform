import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req,res,next)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) return res.status(401).json({ message: "No token is provided"});

    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();     
    } catch (err) {
        console.log("error while decoding in middleware " + err); //remove in production
        res.status(403).json({message: "Invalid token"});
    }
}
