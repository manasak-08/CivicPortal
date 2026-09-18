require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('./connection');

const initDB = async () => {
  try {
    await connectDB();
    const db = mongoose.connection.db;

    console.log('Initializing collections and indexes...');

    const collections = await db.listCollections().toArray();
    const existing = collections.map(c => c.name);

    const required = ['users', 'staffs', 'complaints', 'complaintupdates', 'notifications'];
    for (const name of required) {
      if (!existing.includes(name)) {
        await db.createCollection(name);
        console.log(`Created collection: ${name}`);
      } else {
        console.log(`Collection already exists: ${name}`);
      }
    }
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('complaints').createIndex({ complaint_id: 1 }, { unique: true });
    await db.collection('complaints').createIndex({ user_id: 1 });
    await db.collection('complaints').createIndex({ status: 1 });
    await db.collection('complaintupdates').createIndex({ complaint_id: 1 });
    await db.collection('notifications').createIndex({ user_id: 1 });
    await db.collection('notifications').createIndex({ is_read: 1 });

    console.log('All MongoDB collections and indexes verified.');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
};

initDB();