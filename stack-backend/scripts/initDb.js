import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tag from '../models/Tag.js';
import User from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI environment variable is not set');
  process.exit(1);
}

// Default tags for a stack overflow application
const defaultTags = [
  {
    name: 'javascript',
    description: 'JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification.',
    color: '#f7df1e'
  },
  {
    name: 'react',
    description: 'React is a JavaScript library for building user interfaces, particularly single-page applications.',
    color: '#61dafb'
  },
  {
    name: 'nodejs',
    description: 'Node.js is an open-source, cross-platform JavaScript runtime environment.',
    color: '#339933'
  },
  {
    name: 'python',
    description: 'Python is a high-level, interpreted programming language known for its simplicity and readability.',
    color: '#3776ab'
  },
  {
    name: 'java',
    description: 'Java is a class-based, object-oriented programming language.',
    color: '#ed8b00'
  },
  {
    name: 'html',
    description: 'HTML is the standard markup language for documents designed to be displayed in a web browser.',
    color: '#e34f26'
  },
  {
    name: 'css',
    description: 'CSS is a style sheet language used for describing the presentation of a document written in HTML.',
    color: '#1572b6'
  },
  {
    name: 'mongodb',
    description: 'MongoDB is a source-available cross-platform document-oriented database program.',
    color: '#47a248'
  },
  {
    name: 'express',
    description: 'Express.js is a web application framework for Node.js.',
    color: '#000000'
  },
  {
    name: 'typescript',
    description: 'TypeScript is a programming language developed and maintained by Microsoft.',
    color: '#3178c6'
  },
  {
    name: 'vuejs',
    description: 'Vue.js is a progressive JavaScript framework for building user interfaces.',
    color: '#4fc08d'
  },
  {
    name: 'angular',
    description: 'Angular is a platform for building mobile and desktop web applications.',
    color: '#dd0031'
  },
  {
    name: 'docker',
    description: 'Docker is a set of platform as a service products that use OS-level virtualization.',
    color: '#2496ed'
  },
  {
    name: 'git',
    description: 'Git is a distributed version control system for tracking changes in source code.',
    color: '#f05032'
  },
  {
    name: 'aws',
    description: 'Amazon Web Services is a subsidiary of Amazon providing on-demand cloud computing platforms.',
    color: '#ff9900'
  }
];

const initDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing tags
    await Tag.deleteMany({});
    console.log('Cleared existing tags');

    // Insert default tags
    const createdTags = await Tag.insertMany(defaultTags);
    console.log(`Created ${createdTags.length} default tags`);

    // Create a test admin user if it doesn't exist
    const existingAdmin = await User.findOne({ email: 'admin@stackit.com' });
    if (!existingAdmin) {
      const adminUser = new User({
        username: 'admin',
        email: 'admin@stackit.com',
        password: 'admin123',
        role: 'admin',
        bio: 'System Administrator'
      });
      await adminUser.save();
      console.log('Created admin user: admin@stackit.com / admin123');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization
initDatabase(); 