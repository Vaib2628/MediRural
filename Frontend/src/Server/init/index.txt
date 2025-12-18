const mongoose = require('mongoose');
const User = require('../models/UserModel.js');
const Medicine = require('../models/MedicineModel.js');
const Order = require('../models/OrderModel.js');
const userData = require('./UserData');
const medicineData = require('./MedicineData');
const { createSampleOrders } = require('./OrderData');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Use default MongoDB URI if not defined in environment
const MONGODB_URI = process.env.MONGODB_URI ;

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const initializeDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB successfully');

        // Clear existing data
        console.log('Clearing existing data...');
        await mongoose.connection.collection('users').deleteMany({});
        await mongoose.connection.collection('medicines').deleteMany({});
        await mongoose.connection.collection('orders').deleteMany({});
        console.log('Existing data cleared');

        // Hash passwords for all users
        console.log('Hashing passwords...');
        const hashedUserData = await Promise.all(
            userData.map(async (user) => ({
                ...user,
                password: await hashPassword(user.password)
            }))
        );

        // Insert user data
        console.log('Inserting user data...');
        const users = await User.insertMany(hashedUserData);
        console.log(`Successfully inserted ${users.length} users`);

        // Insert medicine data
        console.log('Inserting medicine data...');
        const medicines = await Medicine.insertMany(medicineData);
        console.log(`Successfully inserted ${medicines.length} medicines`);

        // Create sample orders for revenue testing
        console.log('Creating sample orders for revenue testing...');
        await createSampleOrders();

        console.log('Database initialization completed successfully');
        console.log('\n📋 Login Credentials:');
        console.log('Supplier: patel.supplier@medirural.com / 123456');
        console.log('Admin: patil@medirural.com / 123456');
        console.log('Customer: john@example.com / 123456');
        
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error.message);
        if (error.name === 'MongoServerSelectionError') {
            console.error('Could not connect to MongoDB. Please make sure MongoDB is running.');
        }
        process.exit(1);
    }
};

// Run the initialization
initializeDatabase();
