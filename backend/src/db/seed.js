require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const connectDB = require('./connection');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Seeding database with initial data...');
    await User.deleteMany({});
    await Staff.deleteMany({});
    await Complaint.deleteMany({});
    await ComplaintUpdate.deleteMany({});
    console.log('Cleared existing data.');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const staffPassword = await bcrypt.hash('staff123', salt);
    const citizenPassword = await bcrypt.hash('citizen123', salt);

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      phone: '9876543210',
      address: 'Municipal Corporation Head Office, Civic Center',
      password: adminPassword,
      role: 'admin'
    });
    console.log('Created Admin:', admin.email);

    const staff1User = await User.create({
      name: 'Rajesh Kumar (Lighting Dept)',
      email: 'staff@example.com',
      phone: '9876543211',
      address: 'Zone 1 Maintenance Office, Street Lighting',
      password: staffPassword,
      role: 'staff'
    });
    await Staff.create({
      user_id: staff1User._id,
      name: staff1User.name,
      email: staff1User.email,
      phone: staff1User.phone,
      department: 'Street Lighting'
    });

    const staff2User = await User.create({
      name: 'Pooja Verma (Water Dept)',
      email: 'water_dept@example.com',
      phone: '9876543212',
      address: 'Water Works Division, South Sector',
      password: staffPassword,
      role: 'staff'
    });
    await Staff.create({
      user_id: staff2User._id,
      name: staff2User.name,
      email: staff2User.email,
      phone: staff2User.phone,
      department: 'Water Supply'
    });

    const staff3User = await User.create({
      name: 'Sunil Rao (Sanitation Dept)',
      email: 'clean_dept@example.com',
      phone: '9876543213',
      address: 'Solid Waste Management Zone 3',
      password: staffPassword,
      role: 'staff'
    });
    await Staff.create({
      user_id: staff3User._id,
      name: staff3User.name,
      email: staff3User.email,
      phone: staff3User.phone,
      department: 'Sanitation & Cleaning'
    });

    console.log('Created Staff accounts.');

    const citizen1 = await User.create({
      name: 'Aarav Sharma',
      email: 'citizen@example.com',
      phone: '9876543220',
      address: 'Flat 402, Green Valley Apartments, MG Road',
      password: citizenPassword,
      role: 'citizen'
    });

    const citizen2 = await User.create({
      name: 'Sneha Patel',
      email: 'sneha@example.com',
      phone: '9876543221',
      address: 'B-14, Shanti Nagar Colony',
      password: citizenPassword,
      role: 'citizen'
    });
    console.log('Created Citizen accounts.');
    const currentYear = new Date().getFullYear();

    
    const cmp1 = await Complaint.create({
      complaint_id: `CMP-${currentYear}-0001`,
      user_id: citizen1._id,
      category: 'Street Light',
      title: 'Flickering and dead street light on 4th Main Cross',
      description: 'The street light pole #44 has been dead for the past 4 days, causing safety concerns for pedestrians at night.',
      location: '4th Main Cross, MG Road Junction',
      landmark: 'Near City Bakery',
      image: '',
      status: 'In Progress',
      assigned_staff_id: staff1User._id,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    await ComplaintUpdate.create({
      complaint_id: cmp1._id,
      staff_id: citizen1._id,
      status: 'Submitted',
      remarks: 'Complaint registered by citizen.',
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });
    await ComplaintUpdate.create({
      complaint_id: cmp1._id,
      staff_id: admin._id,
      status: 'Assigned',
      remarks: 'Assigned to Rajesh Kumar (Lighting Dept).',
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });
    await ComplaintUpdate.create({
      complaint_id: cmp1._id,
      staff_id: staff1User._id,
      status: 'In Progress',
      remarks: 'Electrician dispatched with replacement LED ballast.',
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    const cmp2 = await Complaint.create({
      complaint_id: `CMP-${currentYear}-0002`,
      user_id: citizen1._id,
      category: 'Water Pipe Leakage',
      title: 'Severe underground pipe burst flooding pavement',
      description: 'Main potable supply pipeline burst under the pedestrian footpath. Clean drinking water is continuously overflowing into the road.',
      location: 'Outer Ring Road, Service Lane Sector 2',
      landmark: 'Opposite State Bank ATM',
      image: '',
      status: 'Resolved',
      assigned_staff_id: staff2User._id,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    await ComplaintUpdate.create({
      complaint_id: cmp2._id,
      staff_id: citizen1._id,
      status: 'Submitted',
      remarks: 'Complaint registered by citizen.',
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });
    await ComplaintUpdate.create({
      complaint_id: cmp2._id,
      staff_id: admin._id,
      status: 'Assigned',
      remarks: 'Assigned to Pooja Verma (Water Dept).',
      updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    });
    await ComplaintUpdate.create({
      complaint_id: cmp2._id,
      staff_id: staff2User._id,
      status: 'In Progress',
      remarks: 'Excavation completed, 6-inch pipe fracture identified.',
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });
    await ComplaintUpdate.create({
      complaint_id: cmp2._id,
      staff_id: staff2User._id,
      status: 'Resolved',
      remarks: 'New pipeline section welded and pressure tested. Pathway backfilled and sealed.',
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    const cmp3 = await Complaint.create({
      complaint_id: `CMP-${currentYear}-0003`,
      user_id: citizen2._id,
      category: 'Rain Water Drainage',
      title: 'Stormwater drain blocked by silt causing waterlogging',
      description: 'During rain, stormwater overflows into neighboring homes because the roadside drain is clogged with mud and construction debris.',
      location: 'Shanti Nagar Main Road, Gate 3',
      landmark: 'Behind Community Hall',
      image: '',
      status: 'Submitted',
      assigned_staff_id: null,
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000)
    });

    await ComplaintUpdate.create({
      complaint_id: cmp3._id,
      staff_id: citizen2._id,
      status: 'Submitted',
      remarks: 'Complaint registered by citizen.',
      updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000)
    });


    const cmp4 = await Complaint.create({
      complaint_id: `CMP-${currentYear}-0004`,
      user_id: citizen2._id,
      category: 'Roadside Cleaning',
      title: 'Illegal garbage dumping on open road corner',
      description: 'Massive pile of domestic garbage dumped on the pavement, generating foul smell and attracting stray animals.',
      location: 'Market Street, Corner Plot 19',
      landmark: 'Near Vegetable Wholesale Market',
      image: '',
      status: 'Assigned',
      assigned_staff_id: staff3User._id,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    await ComplaintUpdate.create({
      complaint_id: cmp4._id,
      staff_id: citizen2._id,
      status: 'Submitted',
      remarks: 'Complaint registered by citizen.',
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    await ComplaintUpdate.create({
      complaint_id: cmp4._id,
      staff_id: admin._id,
      status: 'Assigned',
      remarks: 'Assigned to Sunil Rao (Sanitation Dept) for immediate waste clearing truck.',
      updated_at: new Date(Date.now() - 18 * 60 * 60 * 1000)
    });

    console.log('Sample complaints and timeline history seeded successfully!');
    console.log('===========================================================');
    console.log('Demo Credentials:');
    console.log('  Admin:   admin@example.com   / admin123');
    console.log('  Staff:   staff@example.com   / staff123');
    console.log('  Citizen: citizen@example.com / citizen123');
    console.log('===========================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();