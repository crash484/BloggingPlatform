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
    // Winner selection fields
    winner: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
            default: null
        },
        selectedAt: {
            type: Date,
            default: null
        },
        selectionMethod: {
            type: String,
            enum: ['likes', 'random', 'manual', 'ai_scoring'],
            default: null
        },
        score: {
            type: Number,
            default: null
        }
    },
    // Challenge status
    status: {
        type: String,
        enum: ['active', 'ended', 'winner_selected'],
        default: 'active'
    },
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

// Method to get challenge statistics
challengeSchema.methods.getStats = function() {
    return {
        totalParticipants: this.participants.length,
        hasWinner: this.status === 'winner_selected',
        winner: this.winner,
        status: this.status,
        participationRate: this.participants.length > 0 ? 100 : 0
    };
};

// Method to end a challenge
challengeSchema.methods.endChallenge = function() {
    if (this.status === 'active') {
        this.status = 'ended';
    }
    return this.save();
};

// Static method to get challenges that need winner selection
challengeSchema.statics.getChallengesNeedingWinners = function() {
    return this.find({
        status: 'ended',
        'participants.0': { $exists: true } // Has at least one participant
    }).populate('participants.user', 'username email')
      .populate('participants.blog', 'title likes');
};

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;