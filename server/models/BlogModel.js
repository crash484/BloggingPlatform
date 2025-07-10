import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String, // Rich text stored as HTML from Quill
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categories: [{
    type: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  // Flag to mark if this blog is a daily challenge submission
  isChallengeSubmission: {
    type: Boolean,
    default: false
  },
  // Reference to the challenge if this is a challenge submission
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    default: null
  }
}, {
  timestamps: true
});

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
