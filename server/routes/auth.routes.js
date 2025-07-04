import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt  from "jsonwebtoken";
import User from "../models/UserModel.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import Blog from "../models/BlogModel.js"
import Comment from "../models/CommentModel.js"

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
                username: user.username,
                role: user.role
            };

            jwt.sign(payload, key, {expiresIn:'1h'}, (err, token) => {
                if(err) {
                    console.log("JWT signing error:", err);
                    return res.status(500).json({message: "Error generating token"});
                }

                return res.status(200).json({
                    token: token,
                    user: {
                        _id: user._id,
                        name: user.username,
                        email: user.email,
                        role: user.role
                    },
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
    res.json({message:"user is verified"});
})

//path to to retrieve all blogs
router.get("/blogs",async (req,res)=>{
    try {
        //list blogs of all users
        const blogs = await Blog.find().populate('author', 'username email').sort({ createdAt: -1 });
        return res.status(200).json(blogs);
    } catch(err) {
        console.log("Error fetching blogs:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
})

//path to fetch one blog
router.get("/blogs/:id",async(req,res)=>{
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id).populate('author', 'username email');
        
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        return res.status(200).json(blog);
    } catch(err) {
        console.log("Error fetching blog:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
})

//path to create a blog
router.post("/blogs",verifyToken, async (req,res)=>{
    try{
        //get user id and then create a blog object and add the user id to it
        const userId = req.user.id; //this will get user id
        const { title, content, imageUrl, categories } = req.body; // Extract title, content, image, and categories from req.body
        
        console.log("User ID:", userId);
        console.log("Blog data:", { title, content, imageUrl, categories });
        
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }
        
        // Create new blog
        const newBlog = new Blog({
            title,
            content,
            imageUrl: imageUrl,
            categories: categories || [], // Default to empty array if no categories provided
            author: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        const savedBlog = await newBlog.save();
        
        // Populate author data for response
        const populatedBlog = await Blog.findById(savedBlog._id).populate('author', 'username email');
        
        return res.status(201).json(populatedBlog);
        
    } catch(err) {
        console.log("Error creating blog:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
})

//path to update blog
router.put("/blogs/:id",verifyToken, async( req,res)=>{
    try {
        const { id } = req.params;
        const { title, content, image, categories } = req.body;
        const userId = req.user.id;
        
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }
        
        // Find the blog and check if user owns it
        const blog = await Blog.findById(id);
        
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        
        if (blog.author.toString() !== userId) {
            return res.status(403).json({ message: "You can only update your own blogs" });
        }
        
        // Prepare update data
        const updateData = {
            title,
            content,
            updatedAt: new Date()
        };
        
        // Add image if provided
        if (image !== undefined) {
            updateData.imageUrl = image;
        }
        
        // Add categories if provided
        if (categories !== undefined) {
            updateData.categories = categories;
        }
        
        // Update the blog
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('author', 'username email');
        
        return res.status(200).json(updatedBlog);
        
    } catch(err) {
        console.log("Error updating blog:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
})

//path to delete blog
router.delete("/blogs/:id",verifyToken,async(req,res)=>{
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // Find the blog and check if user owns it
        const blog = await Blog.findById(id);
        
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        
        if (blog.author.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own blogs" });
        }
        
        // Delete the blog
        await Blog.findByIdAndDelete(id);
        
        return res.status(200).json({ message: "Blog deleted successfully" });
        
    } catch(err) {
        console.log("Error deleting blog:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
})

//route for when comment is added push to the blogmodel too
router.post("/blogs/:id/comments",verifyToken, async (req,res)=>{
    try {
        const { id: blogId } = req.params; // Get blogId from URL params
        const userId = req.user.id;
        const { text } = req.body;

        if( !text || !text.trim() ) {
            return res.status(400).json({message: "Comment content is required"});
        }

        // Check if blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Create new comment
        const newComment = new Comment({
            text: text.trim(),
            user: userId,
            blog: blogId
        });

        // Save the comment
        const savedComment = await newComment.save();

        // Add comment ID to the blog's comments array
        await Blog.findByIdAndUpdate(blogId, {
            $push: { comments: savedComment._id }
        });

        // Populate author data for response
        const populatedComment = await Comment.findById(savedComment._id)
            .populate('user', 'username email');

        return res.status(201).json(populatedComment);

    } catch(err) {
        console.log("Error creating comment:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
})

//route for when like is added push it to the blogmodel too
router.post("/blogs/:id/like", verifyToken, async (req, res) => {
    try {
        const { id: blogId } = req.params;
        const userId = req.user.id;

        // Check if blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Check if user already liked this blog
        const hasLiked = blog.likes && blog.likes.includes(userId);

        let updatedBlog;
        let message;

        if (hasLiked) {
            // Unlike: Remove user from likes array
            updatedBlog = await Blog.findByIdAndUpdate(
                blogId,
                { $pull: { likes: userId } },
                { new: true }
            ).populate('author', 'username email');
            message = "Blog unliked successfully";
        } else {
            // Like: Add user to likes array
            updatedBlog = await Blog.findByIdAndUpdate(
                blogId,
                { $addToSet: { likes: userId } }, // $addToSet prevents duplicates
                { new: true }
            ).populate('author', 'username email');
            message = "Blog liked successfully";
        }

        return res.status(200).json(updatedBlog);

    } catch(err) {
        console.log("Error toggling like:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
})

// Route to update user role (for admin management)
router.put("/admin/users/:id/role", verifyToken, async (req, res) => {
    try {
        const { id: targetUserId } = req.params;
        const { role } = req.body;
        const currentUserId = req.user.id;

        // Check if current user is admin
        const currentUser = await User.findById(currentUserId);
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can update user roles" });
        }

        // Validate role
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
        }

        // Update user role
        const updatedUser = await User.findByIdAndUpdate(
            targetUserId,
            { role },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: `User role updated to ${role} successfully`,
            user: updatedUser
        });

    } catch (err) {
        console.log("Error updating user role:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Route to get all users with their post statistics (admin only)
router.get("/admin", verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Check if current user is admin
        const currentUser = await User.findById(currentUserId);
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can access user statistics" });
        }

        // Get all users with their basic info
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });

        // Get detailed statistics for each user
        const userStatistics = await Promise.all(users.map(async (user) => {
            // Get all blogs by this user with populated data
            const userBlogs = await Blog.find({ author: user._id })
                .populate('author', 'username email')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user',
                        select: 'username email'
                    }
                })
                .sort({ createdAt: -1 });

            // Calculate total likes and comments across all user's blogs
            const totalLikes = userBlogs.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0);
            const totalComments = userBlogs.reduce((sum, blog) => sum + (blog.comments?.length || 0), 0);

            // Format blog details with individual stats
            const blogDetails = userBlogs.map(blog => ({
                _id: blog._id,
                title: blog.title,
                content: blog.content.substring(0, 150) + (blog.content.length > 150 ? '...' : ''),
                imageUrl: blog.imageUrl,
                categories: blog.categories,
                createdAt: blog.createdAt,
                updatedAt: blog.updatedAt,
                likesCount: blog.likes?.length || 0,
                commentsCount: blog.comments?.length || 0,
                comments: blog.comments || []
            }));

            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                bio: user.bio,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                statistics: {
                    totalPosts: userBlogs.length,
                    totalLikes: totalLikes,
                    totalComments: totalComments
                },
                posts: blogDetails
            };
        }));

        // Sort users by total posts (most active first)
        userStatistics.sort((a, b) => b.statistics.totalPosts - a.statistics.totalPosts);

        return res.status(200).json({
            message: "User statistics retrieved successfully",
            totalUsers: userStatistics.length,
            users: userStatistics
        });

    } catch (err) {
        console.log("Error fetching user statistics:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;