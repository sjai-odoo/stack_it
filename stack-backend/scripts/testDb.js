import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI environment variable is not set');
  process.exit(1);
}

const testDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Get database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 Database Collections:');
    if (collections.length === 0) {
      console.log('   No collections found. Run "npm run init-db" to create initial data.');
    } else {
      collections.forEach(collection => {
        console.log(`   - ${collection.name}`);
      });
    }
    
    // Test models
    console.log('\n🔍 Testing Models:');
    
    const User = mongoose.model('User');
    const userCount = await User.countDocuments();
    console.log(`   Users: ${userCount}`);
    
    const Tag = mongoose.model('Tag');
    const tagCount = await Tag.countDocuments();
    console.log(`   Tags: ${tagCount}`);
    
    const Question = mongoose.model('Question');
    const questionCount = await Question.countDocuments();
    console.log(`   Questions: ${questionCount}`);
    
    const Answer = mongoose.model('Answer');
    const answerCount = await Answer.countDocuments();
    console.log(`   Answers: ${answerCount}`);
    
    const Comment = mongoose.model('Comment');
    const commentCount = await Comment.countDocuments();
    console.log(`   Comments: ${commentCount}`);
    
    const Notification = mongoose.model('Notification');
    const notificationCount = await Notification.countDocuments();
    console.log(`   Notifications: ${notificationCount}`);
    
    console.log('\n✅ Database test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing database:', error);
    process.exit(1);
  }
};

// Run the test
testDatabase(); 