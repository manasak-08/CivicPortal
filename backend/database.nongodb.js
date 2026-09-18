/**
 * MongoDB Database Setup Script (mongosh compatible)
 * Database Name: complaint_system
 *
 * How to run directly in MongoDB Shell:
 *   mongosh < database.mongodb.js
 * Or inside mongosh:
 *   load('database.mongodb.js')
 */

// Switch to complaint_system database
use('complaint_system');

// 1. Drop existing collections if re-initializing
db.complaintupdates.drop();
db.complaints.drop();
db.staffs.drop();
db.users.drop();

print("Database cleared. Creating collections with schema validation...");

// 2. Create Users Collection with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "phone", "address", "password", "role"],
      properties: {
        name: { bsonType: "string", description: "Full name is required" },
        email: { bsonType: "string", pattern: "^.+@.+$", description: "Valid email is required" },
        phone: { bsonType: "string", description: "Phone number is required" },
        address: { bsonType: "string", description: "Address is required" },
        password: { bsonType: "string", description: "Hashed password is required" },
        role: { enum: ["citizen", "staff", "admin"], description: "Role must be citizen, staff, or admin" },
        created_at: { bsonType: "date" }
      }
    }
  }
});

// Indexes for users
db.users.createIndex({ email: 1 }, { unique: true });

// 3. Create Staffs Collection
db.createCollection("staffs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "name", "email", "phone", "department"],
      properties: {
        user_id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        email: { bsonType: "string" },
        phone: { bsonType: "string" },
        department: { bsonType: "string" },
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.staffs.createIndex({ email: 1 }, { unique: true });
db.staffs.createIndex({ user_id: 1 }, { unique: true });

// 4. Create Complaints Collection
db.createCollection("complaints", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["complaint_id", "user_id", "category", "title", "description", "location", "status"],
      properties: {
        complaint_id: { bsonType: "string" },
        user_id: { bsonType: "objectId" },
        category: { enum: ["Street Light", "Water Pipe Leakage", "Rain Water Drainage", "Roadside Cleaning"] },
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        location: { bsonType: "string" },
        landmark: { bsonType: "string" },
        image: { bsonType: "string" },
        status: { enum: ["Submitted", "Pending", "Assigned", "In Progress", "Resolved", "Closed", "Rejected"] },
        assigned_staff_id: { bsonType: ["objectId", "null"] },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.complaints.createIndex({ complaint_id: 1 }, { unique: true });
db.complaints.createIndex({ user_id: 1 });
db.complaints.createIndex({ status: 1 });
db.complaints.createIndex({ category: 1 });

// 5. Create ComplaintUpdates Collection (History Timeline)
db.createCollection("complaintupdates", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["complaint_id", "staff_id", "status", "remarks"],
      properties: {
        complaint_id: { bsonType: "objectId" },
        staff_id: { bsonType: "objectId" },
        status: { enum: ["Submitted", "Pending", "Assigned", "In Progress", "Resolved", "Closed", "Rejected"] },
        remarks: { bsonType: "string" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.complaintupdates.createIndex({ complaint_id: 1 });

print("MongoDB collections and indexes successfully initialized for complaint_system!");