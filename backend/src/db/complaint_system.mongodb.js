/**
 * MongoDB Database Setup & Initialization Script
 * Database: complaint_system
 * Can be executed via mongosh:
 * mongosh mongodb://127.0.0.1:27017/complaint_system complaint_system.mongodb.js
 */

// Switch to complaint_system database
use('complaint_system');

// 1. Users Collection
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password', 'role'],
      properties: {
        name: { bsonType: 'string', description: 'Full name is required' },
        email: { bsonType: 'string', pattern: '^.+@.+$', description: 'Valid email required' },
        phone: { bsonType: 'string' },
        address: { bsonType: 'string' },
        password: { bsonType: 'string', description: 'Hashed password' },
        role: { enum: ['citizen', 'staff', 'admin'], description: 'Must be citizen, staff, or admin' },
        created_at: { bsonType: 'date' }
      }
    }
  }
});
db.users.createIndex({ email: 1 }, { unique: true });

// 2. Staff Collection
db.createCollection('staffs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'department'],
      properties: {
        user_id: { bsonType: 'objectId' },
        name: { bsonType: 'string' },
        email: { bsonType: 'string' },
        phone: { bsonType: 'string' },
        department: { bsonType: 'string' },
        created_at: { bsonType: 'date' }
      }
    }
  }
});
db.staffs.createIndex({ email: 1 });

// 3. Complaints Collection
db.createCollection('complaints', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['complaint_id', 'user_id', 'category', 'title', 'description', 'location', 'status'],
      properties: {
        complaint_id: { bsonType: 'string' },
        user_id: { bsonType: 'objectId' },
        category: {
          enum: ['Street Light', 'Water Pipe Leakage', 'Rain Water Drainage', 'Roadside Cleaning']
        },
        title: { bsonType: 'string' },
        description: { bsonType: 'string' },
        location: { bsonType: 'string' },
        landmark: { bsonType: 'string' },
        image: { bsonType: 'string' },
        status: {
          enum: ['Submitted', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected']
        },
        assigned_staff_id: { bsonType: ['objectId', 'null'] },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});
db.complaints.createIndex({ complaint_id: 1 }, { unique: true });
db.complaints.createIndex({ user_id: 1 });
db.complaints.createIndex({ status: 1 });

// 4. Complaint Updates Collection
db.createCollection('complaintupdates', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['complaint_id', 'status'],
      properties: {
        complaint_id: { bsonType: 'objectId' },
        staff_id: { bsonType: 'objectId' },
        status: { bsonType: 'string' },
        remarks: { bsonType: 'string' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});
db.complaintupdates.createIndex({ complaint_id: 1 });

// 5. Notifications Collection
db.createCollection('notifications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'title', 'message'],
      properties: {
        user_id: { bsonType: 'objectId' },
        complaint_id: { bsonType: ['objectId', 'null'] },
        complaint_code: { bsonType: 'string' },
        title: { bsonType: 'string' },
        message: { bsonType: 'string' },
        type: { bsonType: 'string' },
        is_read: { bsonType: 'bool' },
        created_at: { bsonType: 'date' }
      }
    }
  }
});
db.notifications.createIndex({ user_id: 1 });
db.notifications.createIndex({ is_read: 1 });
db.notifications.createIndex({ created_at: -1 });

print("✅ MongoDB database complaint_system initialized with collections and indexes!");
