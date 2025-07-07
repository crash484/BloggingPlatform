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
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            
            const category = specificCategory || this.getRandomCategory();
            const difficulty = this.getRandomDifficulty();
            
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

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Parse the JSON response
            let challengeData;
            try {
                // Extract JSON from the response (remove any markdown formatting)
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    challengeData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (parseError) {
                console.log('Failed to parse AI response, using fallback');
                challengeData = this.getFallbackChallenge(category);
            }

            return {
                topic: challengeData.topic,
                category: category,
                description: challengeData.description,
                difficulty: difficulty,
                tags: challengeData.tags || [],
                metadata: {
                    promptUsed: prompt,
                    generatedAt: new Date(),
                    aiModel: 'gemini-2.0-flash-exp'
                }
            };

        } catch (error) {
            console.error('Error generating challenge with AI:', error);
            // Fallback to predefined challenges
            return this.getFallbackChallenge(specificCategory);
        }
    }

    // Create and save today's challenge
    async createTodaysChallenge() {
        try {
            // Check if today's challenge already exists
            const existingChallenge = await Challenge.getTodaysChallenge();
            if (existingChallenge) {
                return existingChallenge;
            }

            // Generate new challenge
            const challengeData = await this.generateDailyChallenge();
            
            // Set the date to today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const challenge = new Challenge({
                ...challengeData,
                date: today,
                createdBy: 'AI'
            });

            const savedChallenge = await challenge.save();
            console.log('Daily challenge created:', savedChallenge.topic);
            return savedChallenge;

        } catch (error) {
            console.error('Error creating today\'s challenge:', error);
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

            return {
                totalChallenges,
                activeChallenges,
                todaysChallenge: todaysChallenge ? true : false,
                totalParticipations: participationStats.length > 0 ? participationStats[0].totalParticipants : 0
            };
        } catch (error) {
            console.error('Error getting challenge stats:', error);
            throw error;
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
}

export default new ChallengeService();