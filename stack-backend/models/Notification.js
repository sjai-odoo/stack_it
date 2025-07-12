import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'answer',           // Someone answered your question
      'comment',          // Someone commented on your question/answer
      'vote',             // Someone voted on your question/answer
      'accept',           // Your answer was accepted
      'mention',          // Someone mentioned you in a comment
      'bounty',           // Bounty awarded
      'moderation',       // Moderation action
      'system'            // System notification
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  isRead: {
    type: Boolean,
    default: false
  },
  data: {
    // Flexible object to store additional data
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    answerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer'
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    voteType: {
      type: String,
      enum: ['upvote', 'downvote']
    },
    bountyAmount: {
      type: Number
    }
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Notifications expire after 30 days
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  return await notification.save();
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    recipient: userId,
    isRead: false
  });
};

export default mongoose.model('Notification', notificationSchema); 