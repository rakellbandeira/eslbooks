// reset-progress.js
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Drop the collection entirely
      await mongoose.connection.collection('userprogresses').drop();
      console.log('UserProgress collection dropped successfully');
    } catch (err) {
      // Collection might not exist yet
      console.log('Collection may not exist, continuing...');
    }
    
    // Create the UserProgress model with proper indexes
    const UserProgressSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      bookFilename: String,
      currentEpisode: Number,
      currentPage: Number,
      totalPages: Number,
      percentComplete: Number,
      lastRead: Date
    });
    
    // Create the index properly
    UserProgressSchema.index({ userId: 1, bookFilename: 1 }, { unique: true });
    
    const UserProgress = mongoose.model('UserProgress', UserProgressSchema, 'userprogresses');
    
    // This will ensure the collection and indexes are created
    await UserProgress.createCollection();
    console.log('Collection created with proper indexes');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });