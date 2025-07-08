import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Technology', 'Lifestyle', 'Health', 'Science', 'Art', 'Business', 'Education', 'Environment', 'Travel', 'Food', 'Sports', 'Politics', 'Entertainment']
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        unique: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        enum: ['AI', 'Admin'],
        default: 'AI'
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        },
        submittedAt: {
            type: Date,
            default: Date.now
        }
    }],
    metadata: {
        promptUsed: String,
        generatedAt: Date,
        aiModel: String
    }
}, {
    timestamps: true
});

// Index for efficient date queries
challengeSchema.index({ date: 1 });
challengeSchema.index({ isActive: 1 });

// Method to get today's challenge
challengeSchema.statics.getTodaysChallenge = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.findOne({
        date: { $gte: today, $lt: tomorrow },
        isActive: true
    });
};

// Method to check if user has participated in a challenge
challengeSchema.methods.hasUserParticipated = function(userId) {
    return this.participants.some(participant => 
        participant.user.toString() === userId.toString()
    );
};

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;