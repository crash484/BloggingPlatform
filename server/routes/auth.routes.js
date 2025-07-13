import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import Blog from "../models/BlogModel.js"
import Comment from "../models/CommentModel.js"
import Challenge from "../models/ChallengeModel.js"
import ChallengeService from "../services/ChallengeService.js"

const router = express.Router();
dotenv.config();
const key = process.env.SECRET_KEY;

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        //check if user with email already exists or not
        const alreadyExists = await User.findOne({ email });

        if (alreadyExists) return res.status(403).json({ message: "user with email already exists" });


        const hashed = await bcrypt.hash(password, 10);

        const user = new User({ username: name, email, password: hashed });

        const result = await user.save();

        if (result) return res.status(200).json({ message: "User is successfully registered" });
        else return res.status(403).json({ message: "unable to register user" });

    } catch (err) {
        return res.status(500).json({ message: "internal server error" });
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        //implement jwt verification when able to send and recieve jwt
        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: "user with email doesnt exists" });

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Create a clean payload without sensitive data
            const payload = {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            };

            jwt.sign(payload, key, { expiresIn: '1h' }, (err, token) => {
                if (err) {
                    return res.status(500).json({ message: "Error generating token" });
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
            return res.status(401).json({ message: "invalid password" });
        }
    } catch (err) {
        return res.status(500).json({ message: "internal server error" });
    }
})

router.post('/verify', verifyToken, (req, res) => {
    res.json({ message: "user is verified" });
})

// Debug endpoint to check user role
router.get('/debug/user-role', verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const currentUser = await User.findById(currentUserId);

        res.json({
            message: "User role debug info",
            userId: currentUserId,
            userFound: !!currentUser,
            userRole: currentUser?.role,
            userEmail: currentUser?.email,
            userUsername: currentUser?.username
        });
    } catch (err) {
        console.log("Error in debug endpoint:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
})

//path to to retrieve all blogs
router.get("/blogs", async (req, res) => {
    try {
        //list blogs of all users
        const blogs = await Blog.find().populate('author', 'username email').sort({ createdAt: -1 });
        return res.status(200).json(blogs);
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

//path to fetch one blog
router.get("/blogs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id).populate('author', 'username email');

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        return res.status(200).json(blog);
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

//path to create a blog
router.post("/blogs", verifyToken, async (req, res) => {
    try {
        //get user id and then create a blog object and add the user id to it
        const userId = req.user.id; //this will get user id
        const { title, content, imageUrl, categories } = req.body; // Extract title, content, image, and categories from req.body

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

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

//path to update blog
router.put("/blogs/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, imageUrl, categories } = req.body;
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

        // Add imageUrl if provided
        if (imageUrl !== undefined) {
            updateData.imageUrl = imageUrl;
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

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

//path to delete blog
router.delete("/blogs/:id", verifyToken, async (req, res) => {
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

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

//route for when comment is added push to the blogmodel too
router.post("/blogs/:id/comments", verifyToken, async (req, res) => {
    try {
        const { id: blogId } = req.params; // Get blogId from URL params
        const userId = req.user.id;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Comment content is required" });
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

    } catch (err) {
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

    } catch (err) {
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
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Get today's daily challenge
router.get("/daily-challenge", async (req, res) => {
    try {
        let todaysChallenge = await Challenge.getTodaysChallenge();

        // If no challenge exists for today, create one
        if (!todaysChallenge) {
            todaysChallenge = await ChallengeService.createTodaysChallenge();
        }

        return res.status(200).json({
            message: "Today's challenge retrieved successfully",
            challenge: todaysChallenge
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get challenge leaderboard (most active participants) - MOVED UP TO AVOID CONFLICT WITH :id ROUTE
router.get("/daily-challenge/leaderboard", async (req, res) => {
    try {
        const { limit = 10, timeframe = 'all' } = req.query;

        let dateFilter = {};
        if (timeframe === 'month') {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            dateFilter = { date: { $gte: lastMonth } };
        } else if (timeframe === 'week') {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            dateFilter = { date: { $gte: lastWeek } };
        }

        const leaderboard = await Challenge.aggregate([
            { $match: { isActive: true, ...dateFilter } },
            { $unwind: '$participants' },
            {
                $group: {
                    _id: '$participants.user',
                    challengesCompleted: { $sum: 1 },
                    lastParticipation: { $max: '$participants.submittedAt' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    challengesCompleted: 1,
                    lastParticipation: 1,
                    username: '$user.username',
                    email: '$user.email',
                    avatarUrl: '$user.avatarUrl'
                }
            },
            { $sort: { challengesCompleted: -1, lastParticipation: -1 } },
            { $limit: parseInt(limit) }
        ]);

        return res.status(200).json({
            message: "Leaderboard retrieved successfully",
            leaderboard: leaderboard,
            timeframe: timeframe
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get challenge statistics (admin or general stats)
router.get("/daily-challenge/stats", verifyToken, async (req, res) => {
    try {
        const stats = await ChallengeService.getChallengeStats();

        return res.status(200).json({
            message: "Challenge statistics retrieved successfully",
            stats: stats
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Check AI service status and challenge generation details (admin only)
router.get("/admin/daily-challenge/ai-status", verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Check if current user is admin
        const currentUser = await User.findById(currentUserId);

        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can check AI status" });
        }

        const aiStatus = await ChallengeService.checkAIStatus();
        const stats = await ChallengeService.getChallengeStats();

        // Get today's challenge details
        const todaysChallenge = await Challenge.getTodaysChallenge();

        return res.status(200).json({
            message: "AI status and challenge details retrieved successfully",
            aiStatus: aiStatus,
            stats: stats,
            todaysChallenge: todaysChallenge ? {
                topic: todaysChallenge.topic,
                category: todaysChallenge.category,
                difficulty: todaysChallenge.difficulty,
                createdBy: todaysChallenge.createdBy,
                isAIGenerated: todaysChallenge.metadata?.isAIGenerated || false,
                createdAt: todaysChallenge.createdAt,
                participants: todaysChallenge.participants?.length || 0
            } : null
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Participate in today's challenge (submit a blog for the challenge)
router.post("/daily-challenge/participate", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { blogId } = req.body;

        if (!blogId) {
            return res.status(400).json({ message: "Blog ID is required" });
        }

        // Verify the blog exists and belongs to the user
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        if (blog.author.toString() !== userId) {
            return res.status(403).json({ message: "You can only submit your own blogs" });
        }

        // Get today's challenge
        let todaysChallenge = await Challenge.getTodaysChallenge();
        if (!todaysChallenge) {
            todaysChallenge = await ChallengeService.createTodaysChallenge();
        }

        // Mark the blog as a challenge submission
        await Blog.findByIdAndUpdate(blogId, {
            isChallengeSubmission: true,
            challenge: todaysChallenge._id
        });

        // Add participation
        const updatedChallenge = await ChallengeService.addParticipation(
            todaysChallenge._id,
            userId,
            blogId
        );

        return res.status(200).json({
            message: "Successfully participated in today's challenge",
            challenge: updatedChallenge
        });

    } catch (err) {
        if (err.message.includes('already participated')) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get challenge by ID - MOVED DOWN TO AVOID CONFLICT WITH SPECIFIC ROUTES
router.get("/daily-challenge/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const challenge = await Challenge.findById(id).populate('participants.user', 'username email');

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        return res.status(200).json({
            message: "Challenge retrieved successfully",
            challenge: challenge
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Participate in today's challenge (submit a blog for the challenge)
router.post("/daily-challenge/participate", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { blogId } = req.body;

        if (!blogId) {
            return res.status(400).json({ message: "Blog ID is required" });
        }

        // Verify the blog exists and belongs to the user
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        if (blog.author.toString() !== userId) {
            return res.status(403).json({ message: "You can only submit your own blogs" });
        }

        // Get today's challenge
        let todaysChallenge = await Challenge.getTodaysChallenge();
        if (!todaysChallenge) {
            todaysChallenge = await ChallengeService.createTodaysChallenge();
        }

        // Mark the blog as a challenge submission
        await Blog.findByIdAndUpdate(blogId, {
            isChallengeSubmission: true,
            challenge: todaysChallenge._id
        });

        // Add participation
        const updatedChallenge = await ChallengeService.addParticipation(
            todaysChallenge._id,
            userId,
            blogId
        );

        return res.status(200).json({
            message: "Successfully participated in today's challenge",
            challenge: updatedChallenge
        });

    } catch (err) {
        if (err.message.includes('already participated')) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get challenge statistics (admin or general stats)
router.get("/daily-challenge/stats", verifyToken, async (req, res) => {
    try {
        const stats = await ChallengeService.getChallengeStats();

        return res.status(200).json({
            message: "Challenge statistics retrieved successfully",
            stats: stats
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get all challenges with pagination (admin only)
router.get("/admin/daily-challenges", verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { page = 1, limit = 10, category, difficulty } = req.query;

        // Check if current user is admin
        const currentUser = await User.findById(currentUserId);
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can access all challenges" });
        }

        // Build query filters
        const filters = { isActive: true };
        if (category) filters.category = category;
        if (difficulty) filters.difficulty = difficulty;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get challenges with pagination
        const challenges = await Challenge.find(filters)
            .populate('participants.user', 'username email')
            .populate('participants.blog', 'title createdAt')
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalChallenges = await Challenge.countDocuments(filters);
        const totalPages = Math.ceil(totalChallenges / parseInt(limit));

        return res.status(200).json({
            message: "Challenges retrieved successfully",
            challenges: challenges,
            pagination: {
                currentPage: parseInt(page),
                totalPages: totalPages,
                totalChallenges: totalChallenges,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Generate a new challenge manually (admin only)
router.post("/admin/daily-challenge/generate", verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { category, date } = req.body;

        // Check if current user is admin
        const currentUser = await User.findById(currentUserId);
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can generate challenges" });
        }

        // Generate challenge data
        const challengeData = await ChallengeService.generateDailyChallenge(category);

        // Set the date (default to today if not provided)
        const challengeDate = date ? new Date(date) : new Date();
        challengeDate.setHours(0, 0, 0, 0);

        // Check if challenge already exists for this date
        const existingChallenge = await Challenge.findOne({
            date: challengeDate,
            isActive: true
        });

        if (existingChallenge) {
            return res.status(400).json({
                message: "A challenge already exists for this date",
                existingChallenge: existingChallenge
            });
        }

        // Create new challenge
        const challenge = new Challenge({
            ...challengeData,
            date: challengeDate,
            createdBy: 'Admin'
        });

        const savedChallenge = await challenge.save();

        return res.status(201).json({
            message: "Challenge generated successfully",
            challenge: savedChallenge
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Select winner for a challenge (admin only)
router.post("/admin/daily-challenge/:id/select-winner", verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { id: challengeId } = req.params;
        const { method = 'likes', userId, blogId } = req.body;

        // Check if current user is admin
        const currentUser = await User.findById(currentUserId);
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can select winners" });
        }

        let updatedChallenge;

        if (method === 'manual' && userId && blogId) {
            updatedChallenge = await ChallengeService.selectWinnerManually(challengeId, userId, blogId);
        } else {
            updatedChallenge = await ChallengeService.selectWinner(challengeId, method);
        }

        return res.status(200).json({
            message: "Winner selected successfully",
            challenge: updatedChallenge
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get challenge winners (leaderboard)
router.get("/daily-challenge/winners", async (req, res) => {
    try {
        const { timeframe = 'all', limit = 10 } = req.query;

        const winners = await ChallengeService.getChallengeWinners(timeframe, parseInt(limit));

        return res.status(200).json({
            message: "Winners retrieved successfully",
            winners: winners,
            timeframe: timeframe
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get challenge details with participants and winner
router.get("/daily-challenge/:id/details", async (req, res) => {
    try {
        const { id } = req.params;

        const challenge = await Challenge.findById(id)
            .populate('participants.user', 'username email')
            .populate('participants.blog', 'title content likes createdAt')
            .populate('winner.user', 'username email')
            .populate('winner.blog', 'title content likes');

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        return res.status(200).json({
            message: "Challenge details retrieved successfully",
            challenge: challenge
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// End yesterday's challenges (admin only)
router.post("/admin/daily-challenge/end-yesterday", verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Check if current user is admin
        const currentUser = await User.findById(currentUserId);
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can end challenges" });
        }

        const results = await ChallengeService.endYesterdaysChallenges();

        return res.status(200).json({
            message: "Yesterday's challenges ended successfully",
            results: results
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Auto-select winners for ended challenges (admin only)
router.post("/admin/daily-challenge/auto-select-winners", verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Check if current user is admin
        const currentUser = await User.findById(currentUserId);
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can auto-select winners" });
        }

        const results = await ChallengeService.autoSelectWinners();

        return res.status(200).json({
            message: "Winners auto-selected successfully",
            results: results
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get challenges that need winner selection (admin only)
router.get("/admin/daily-challenge/needs-winners", verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Check if current user is admin
        const currentUser = await User.findById(currentUserId);
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can access this endpoint" });
        }

        const challenges = await Challenge.getChallengesNeedingWinners();

        return res.status(200).json({
            message: "Challenges needing winners retrieved successfully",
            challenges: challenges
        });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}); 

export default router;