import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 2,
    maxlength: 35,
    match: /^[a-z0-9-]+$/
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  color: {
    type: String,
    default: '#007bff',
    match: /^#[0-9A-Fa-f]{6}$/
  },
  usageCount: {
    type: Number,
    default: 0
  },
  isModeratorOnly: {
    type: Boolean,
    default: false
  },
  synonyms: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for search
tagSchema.index({ name: 'text', description: 'text' });

// Method to increment usage count
tagSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Method to decrement usage count
tagSchema.methods.decrementUsage = function() {
  if (this.usageCount > 0) {
    this.usageCount -= 1;
  }
  return this.save();
};

// Static method to find or create tag
tagSchema.statics.findOrCreate = async function(tagName, description = '', createdBy = null) {
  let tag = await this.findOne({ name: tagName.toLowerCase() });
  
  if (!tag) {
    tag = new this({
      name: tagName.toLowerCase(),
      description,
      createdBy
    });
    await tag.save();
  }
  
  return tag;
};

export default mongoose.model('Tag', tagSchema); 