import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 15,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  answer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  votes: {
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Virtual for vote count
commentSchema.virtual('voteCount').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Method to add vote
commentSchema.methods.addVote = function(userId, voteType) {
  if (voteType === 'upvote') {
    // Remove from downvotes if exists
    this.votes.downvotes = this.votes.downvotes.filter(id => !id.equals(userId));
    // Add to upvotes if not already there
    if (!this.votes.upvotes.some(id => id.equals(userId))) {
      this.votes.upvotes.push(userId);
    }
  } else if (voteType === 'downvote') {
    // Remove from upvotes if exists
    this.votes.upvotes = this.votes.upvotes.filter(id => !id.equals(userId));
    // Add to downvotes if not already there
    if (!this.votes.downvotes.some(id => id.equals(userId))) {
      this.votes.downvotes.push(userId);
    }
  }
};

// Method to remove vote
commentSchema.methods.removeVote = function(userId) {
  this.votes.upvotes = this.votes.upvotes.filter(id => !id.equals(userId));
  this.votes.downvotes = this.votes.downvotes.filter(id => !id.equals(userId));
};

// Validation to ensure comment is on either question or answer, not both
commentSchema.pre('save', function(next) {
  if (!this.question && !this.answer) {
    return next(new Error('Comment must be on either a question or an answer'));
  }
  if (this.question && this.answer) {
    return next(new Error('Comment cannot be on both question and answer'));
  }
  next();
});

export default mongoose.model('Comment', commentSchema); 