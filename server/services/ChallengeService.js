import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import Challenge from '../models/ChallengeModel.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class ChallengeService {
    constructor() {
        this.categories = [
            'Technology', 'Lifestyle', 'Health', 'Science', 'Art',
            'Business', 'Education', 'Environment', 'Travel',
            'Food', 'Sports', 'Politics', 'Entertainment'
        ];
        this.difficulties = ['Easy', 'Medium', 'Hard'];
    }

    // Generate a daily challenge using AI
    async generateDailyChallenge(specificCategory = null) {
        try {
            console.log('🤖 Starting AI challenge generation...');

            // Check if GEMINI_API_KEY is available
            if (!process.env.GEMINI_API_KEY) {
                console.log('❌ GEMINI_API_KEY not found in environment variables, using fallback');
                return this.getFallbackChallenge(specificCategory);
            }

            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const category = specificCategory || this.getRandomCategory();
            const difficulty = this.getRandomDifficulty();

            console.log(`🎯 Generating challenge for category: ${category}, difficulty: ${difficulty}`);

            const prompt = `Generate a unique and engaging daily blog writing challenge for the category "${category}" with "${difficulty}" difficulty level.

Requirements:
- Provide a compelling topic title (max 100 characters)
- Write a detailed description that inspires creativity (150-300 words)
- Include 3-5 relevant tags
- Make it thought-provoking and relevant to current trends
- Ensure it's appropriate for all audiences

Return the response in this exact JSON format:
{
    "topic": "Your topic title here",
    "description": "Your detailed description here",
    "tags": ["tag1", "tag2", "tag3"]
}`;

            console.log('📤 Sending request to Gemini AI...');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log('📥 Received AI response:', text.substring(0, 200) + '...');

            // Parse the JSON response
            let challengeData;
            let isAIGenerated = true;

            try {
                // Extract JSON from the response (remove any markdown formatting)
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    challengeData = JSON.parse(jsonMatch[0]);
                    console.log('✅ Successfully parsed AI-generated challenge:', challengeData.topic);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (parseError) {
                console.log('❌ Failed to parse AI response, using fallback');
                console.log('Parse error:', parseError.message);
                challengeData = this.getFallbackChallenge(category);
                isAIGenerated = false;
            }

            const challengeResult = {
                topic: challengeData.topic,
                category: category,
                description: challengeData.description,
                difficulty: difficulty,
                tags: challengeData.tags || [],
                metadata: {
                    promptUsed: prompt,
                    generatedAt: new Date(),
                    aiModel: 'gemini-2.5-flash',
                    isAIGenerated: isAIGenerated,
                    aiResponse: isAIGenerated ? text : null
                }
            };

            console.log(`🎉 Challenge generation ${isAIGenerated ? 'SUCCESS (AI)' : 'FALLBACK (Predefined)'}:`, challengeResult.topic);
            return challengeResult;

        } catch (error) {
            console.error('❌ Error generating challenge with AI:', error.message);
            console.log('🔄 Falling back to predefined challenge...');
            // Fallback to predefined challenges
            return this.getFallbackChallenge(specificCategory);
        }
    }

    // Create and save today's challenge
    async createTodaysChallenge() {
        try {
            console.log('📅 Checking for today\'s challenge...');

            // Check if today's challenge already exists
            const existingChallenge = await Challenge.getTodaysChallenge();
            if (existingChallenge) {
                console.log('✅ Today\'s challenge already exists:', existingChallenge.topic);
                console.log('📊 Challenge details:', {
                    createdBy: existingChallenge.createdBy,
                    isAIGenerated: existingChallenge.metadata?.isAIGenerated || false,
                    category: existingChallenge.category,
                    difficulty: existingChallenge.difficulty
                });
                return existingChallenge;
            }

            console.log('🆕 No challenge found for today, creating new one...');

            // Generate new challenge
            const challengeData = await this.generateDailyChallenge();

            // Set the date to today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const challenge = new Challenge({
                ...challengeData,
                date: today,
                createdBy: challengeData.metadata?.isAIGenerated ? 'AI' : 'Fallback'
            });

            const savedChallenge = await challenge.save();
            console.log('💾 Daily challenge saved to database:', savedChallenge.topic);
            console.log('📊 Final challenge details:', {
                createdBy: savedChallenge.createdBy,
                isAIGenerated: savedChallenge.metadata?.isAIGenerated || false,
                category: savedChallenge.category,
                difficulty: savedChallenge.difficulty,
                tags: savedChallenge.tags
            });
            return savedChallenge;

        } catch (error) {
            console.error('❌ Error creating today\'s challenge:', error);
            throw error;
        }
    }

    // Get random category
    getRandomCategory() {
        return this.categories[Math.floor(Math.random() * this.categories.length)];
    }

    // Get random difficulty
    getRandomDifficulty() {
        return this.difficulties[Math.floor(Math.random() * this.difficulties.length)];
    }

    // Fallback challenges when AI fails
    getFallbackChallenge(category = null) {
        const fallbackChallenges = [
            {
                topic: "The Future of Digital Communication",
                category: "Technology",
                description: "Explore how digital communication has evolved and predict where it might go next. Consider the impact of AI, VR, and emerging technologies on how we connect with each other.",
                difficulty: "Medium",
                tags: ["future", "communication", "technology", "AI", "social-media"]
            },
            {
                topic: "Sustainable Living in Urban Environments",
                category: "Environment",
                description: "Write about practical ways people can live more sustainably in cities. Include tips, challenges, and innovative solutions that urban dwellers can implement in their daily lives.",
                difficulty: "Easy",
                tags: ["sustainability", "urban-living", "environment", "green-living", "climate"]
            },
            {
                topic: "The Art of Mindful Productivity",
                category: "Lifestyle",
                description: "Discuss the balance between being productive and maintaining mental well-being. Explore techniques that help people achieve their goals without burning out.",
                difficulty: "Medium",
                tags: ["productivity", "mindfulness", "wellness", "work-life-balance", "mental-health"]
            },
            {
                topic: "Culinary Adventures Around the World",
                category: "Food",
                description: "Take readers on a virtual food journey. Describe a cuisine you've never tried or want to explore, including its history, key ingredients, and cultural significance.",
                difficulty: "Easy",
                tags: ["food", "culture", "travel", "cuisine", "cooking"]
            },
            {
                topic: "The Science Behind Everyday Phenomena",
                category: "Science",
                description: "Choose an everyday occurrence and explain the fascinating science behind it. Make complex concepts accessible and engaging for general readers.",
                difficulty: "Hard",
                tags: ["science", "education", "physics", "biology", "chemistry"]
            }
        ];

        if (category) {
            const categoryChallenge = fallbackChallenges.find(c => c.category === category);
            if (categoryChallenge) return categoryChallenge;
        }

        return fallbackChallenges[Math.floor(Math.random() * fallbackChallenges.length)];
    }

    // Get challenge statistics
    async getChallengeStats() {
        try {
            const totalChallenges = await Challenge.countDocuments();
            const activeChallenges = await Challenge.countDocuments({ isActive: true });
            const todaysChallenge = await Challenge.getTodaysChallenge();

            const participationStats = await Challenge.aggregate([
                { $unwind: '$participants' },
                { $group: { _id: null, totalParticipants: { $sum: 1 } } }
            ]);

            // Get AI generation statistics
            const aiGeneratedChallenges = await Challenge.countDocuments({
                'metadata.isAIGenerated': true
            });
            const fallbackChallenges = await Challenge.countDocuments({
                'metadata.isAIGenerated': false
            });

            return {
                totalChallenges,
                activeChallenges,
                todaysChallenge: todaysChallenge ? true : false,
                totalParticipations: participationStats.length > 0 ? participationStats[0].totalParticipants : 0,
                aiGeneratedChallenges,
                fallbackChallenges,
                aiSuccessRate: totalChallenges > 0 ? Math.round((aiGeneratedChallenges / totalChallenges) * 100) : 0
            };
        } catch (error) {
            console.error('Error getting challenge stats:', error);
            throw error;
        }
    }

    // Check AI service status
    async checkAIStatus() {
        try {
            const hasApiKey = !!process.env.GEMINI_API_KEY;
            console.log('🔍 Debug: API Key exists:', hasApiKey);
            
            if (!hasApiKey) {
                return {
                    hasApiKey: false,
                    isWorking: false,
                    model: 'gemini-2.0-flash-exp',
                    error: 'No API key found'
                };
            }

            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

            // Test AI connection with a simple prompt
            const testPrompt = 'Say "Hello" in JSON format: {"message": "Hello"}';
            const result = await model.generateContent(testPrompt);
            const response = await result.response;
            const text = response.text();

            console.log('🔍 Debug: AI test response:', text);

            const isWorking = text.includes('Hello');

            return {
                hasApiKey,
                isWorking,
                model: 'gemini-2.0-flash-exp',
                testResponse: text.substring(0, 100)
            };
        } catch (error) {
            console.error('🔍 Debug: AI check error:', error.message);
            return {
                hasApiKey: !!process.env.GEMINI_API_KEY,
                isWorking: false,
                model: 'gemini-2.0-flash-exp',
                error: error.message
            };
        }
    }

    // Add user participation to a challenge
    async addParticipation(challengeId, userId, blogId) {
        try {
            const challenge = await Challenge.findById(challengeId);
            if (!challenge) {
                throw new Error('Challenge not found');
            }

            // Check if user already participated
            if (challenge.hasUserParticipated(userId)) {
                throw new Error('User has already participated in this challenge');
            }

            challenge.participants.push({
                user: userId,
                blog: blogId,
                submittedAt: new Date()
            });

            await challenge.save();
            return challenge;
        } catch (error) {
            console.error('Error adding participation:', error);
            throw error;
        }
    }

    // Select winner for a challenge
    async selectWinner(challengeId, method = 'likes') {
        try {
            const challenge = await Challenge.findById(challengeId)
                .populate({
                    path: 'participants.blog',
                    populate: {
                        path: 'author',
                        select: 'username email'
                    }
                })
                .populate('participants.user', 'username email');

            if (!challenge) {
                throw new Error('Challenge not found');
            }

            if (challenge.participants.length === 0) {
                throw new Error('No participants in this challenge');
            }

            if (challenge.status === 'winner_selected') {
                throw new Error('Winner already selected for this challenge');
            }

            let winner;
            let score = null;

            switch (method) {
                case 'likes':
                    winner = await this.selectWinnerByLikes(challenge);
                    score = winner.blog.likes.length;
                    break;
                case 'random':
                    winner = this.selectWinnerRandomly(challenge);
                    break;
                case 'ai_scoring':
                    winner = await this.selectWinnerByAI(challenge);
                    score = winner.score;
                    break;
                case 'manual':
                    throw new Error('Manual selection requires specific winner ID');
                default:
                    winner = await this.selectWinnerByLikes(challenge);
                    score = winner.blog.likes.length;
            }

            // Update challenge with winner
            challenge.winner = {
                user: winner.user._id,
                blog: winner.blog._id,
                selectedAt: new Date(),
                selectionMethod: method,
                score: score
            };
            challenge.status = 'winner_selected';

            await challenge.save();
            return challenge;

        } catch (error) {
            console.error('Error selecting winner:', error);
            throw error;
        }
    }

    // Select winner by most likes
    async selectWinnerByLikes(challenge) {
        const participantsWithLikes = challenge.participants.map(participant => ({
            user: participant.user,
            blog: participant.blog,
            likesCount: participant.blog.likes.length
        }));

        participantsWithLikes.sort((a, b) => b.likesCount - a.likesCount);
        return participantsWithLikes[0];
    }

    // Select winner randomly
    selectWinnerRandomly(challenge) {
        const randomIndex = Math.floor(Math.random() * challenge.participants.length);
        const participant = challenge.participants[randomIndex];
        return {
            user: participant.user,
            blog: participant.blog
        };
    }

    // Select winner using AI scoring (placeholder for future implementation)
    async selectWinnerByAI(challenge) {
        // For now, use a simple scoring based on content length and likes
        const participantsWithScores = challenge.participants.map(participant => {
            const contentScore = Math.min(participant.blog.content.length / 100, 10); // Max 10 points for content
            const likesScore = participant.blog.likes.length * 2; // 2 points per like
            const totalScore = contentScore + likesScore;

            return {
                user: participant.user,
                blog: participant.blog,
                score: totalScore
            };
        });

        participantsWithScores.sort((a, b) => b.score - a.score);
        return participantsWithScores[0];
    }

    // Manually select winner
    async selectWinnerManually(challengeId, userId, blogId) {
        try {
            const challenge = await Challenge.findById(challengeId);
            if (!challenge) {
                throw new Error('Challenge not found');
            }

            // Verify the user participated in this challenge
            const participant = challenge.participants.find(p =>
                p.user.toString() === userId && p.blog.toString() === blogId
            );

            if (!participant) {
                throw new Error('User did not participate in this challenge with this blog');
            }

            challenge.winner = {
                user: userId,
                blog: blogId,
                selectedAt: new Date(),
                selectionMethod: 'manual'
            };
            challenge.status = 'winner_selected';

            await challenge.save();
            return challenge;

        } catch (error) {
            console.error('Error manually selecting winner:', error);
            throw error;
        }
    }

    // Get challenge winners (for leaderboards)
    async getChallengeWinners(timeframe = 'all', limit = 10) {
        try {
            let dateFilter = {};

            if (timeframe === 'week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                dateFilter = { 'winner.selectedAt': { $gte: oneWeekAgo } };
            } else if (timeframe === 'month') {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                dateFilter = { 'winner.selectedAt': { $gte: oneMonthAgo } };
            }

            const winners = await Challenge.find({
                status: 'winner_selected',
                ...dateFilter
            })
                .populate('winner.user', 'username email')
                .populate('winner.blog', 'title')
                .sort({ 'winner.selectedAt': -1 })
                .limit(limit);

            return winners;

        } catch (error) {
            console.error('Error getting challenge winners:', error);
            throw error;
        }
    }

    // Auto-select winners for ended challenges
    async autoSelectWinners() {
        try {
            const challengesNeedingWinners = await Challenge.getChallengesNeedingWinners();
            const results = [];

            for (const challenge of challengesNeedingWinners) {
                try {
                    const updatedChallenge = await this.selectWinner(challenge._id, 'likes');
                    results.push({
                        challengeId: challenge._id,
                        topic: challenge.topic,
                        winner: updatedChallenge.winner,
                        status: 'success'
                    });
                } catch (error) {
                    results.push({
                        challengeId: challenge._id,
                        topic: challenge.topic,
                        error: error.message,
                        status: 'failed'
                    });
                }
            }

            return results;

        } catch (error) {
            console.error('Error auto-selecting winners:', error);
            throw error;
        }
    }

    // End yesterday's challenges and prepare for winner selection
    async endYesterdaysChallenges() {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const yesterdaysChallenges = await Challenge.find({
                date: { $gte: yesterday, $lt: today },
                status: 'active'
            });

            const results = [];

            for (const challenge of yesterdaysChallenges) {
                try {
                    await challenge.endChallenge();
                    results.push({
                        challengeId: challenge._id,
                        topic: challenge.topic,
                        participants: challenge.participants.length,
                        status: 'ended'
                    });
                } catch (error) {
                    results.push({
                        challengeId: challenge._id,
                        topic: challenge.topic,
                        error: error.message,
                        status: 'failed'
                    });
                }
            }

            return results;

        } catch (error) {
            console.error('Error ending yesterday\'s challenges:', error);
            throw error;
        }
    }
}

export default new ChallengeService();