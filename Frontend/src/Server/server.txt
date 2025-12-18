const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Medicine = require('./models/MedicineModel');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const cookieParser = require('cookie-parser');
const auth = require('./middlewares/auth');
const cronRoutes = require('./routes/cron');
// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS configuration
app.use(cors({
    origin: true, // Allow all origins
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medirural';
console.log('Attempting to connect to MongoDB at:', MONGODB_URI);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB.');
        console.log('Database name:', mongoose.connection.name);
        
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    });


//routes definations
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cron', cronRoutes);
// Public route for getting all medicines
app.get('/api/medicines/categories', async (req, res) => {
    try {
        const categories = await Medicine.distinct('category');
        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.json({success: false, message: error.message});
    }
});
app.get('/api/medicines', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        
        // If search term is provided, use regex search for partial matching
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i'); // 'i' for case-insensitive
            query.$or = [
                { name: searchRegex },
                { category: searchRegex },
                { manufacturer: searchRegex },
                { description: searchRegex }
            ];
        }
        
        // If category filter is provided
        if (category && category !== 'All') {
            query.category = category;
        }
        
        // Execute the query
        const medicines = await Medicine.find(query).sort({ name: 1 });
        
        res.json({
            success: true,
            medicines
        });
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.json({success: false, message: error.message});
    }
});
app.get('/api/medicines/:id', async (req, res)=>{
    try {
        const medicine = await Medicine.findById(req.params.id);    
        res.json({
            success: true,
            medicine
        });
    } catch (error) {
        res.json({success: false, message: error.message});
    }
})

// Public PATCH route for updating medicine stock
app.patch('/api/medicines/:id', async (req, res) => {
    console.log('PATCH request received:', req.params.id, req.body);
    try {
        const { id } = req.params;
        const { stock } = req.body;

        console.log('Updating medicine:', id, 'to stock:', stock);

        if (typeof stock !== 'number' || stock < 0) {
            console.log('Invalid stock value:', stock);
            return res.status(400).json({ 
                success: false, 
                message: 'Stock must be a non-negative number' 
            });
        }

        const updatedMedicine = await Medicine.findByIdAndUpdate(
            id, 
            { stock }, 
            { new: true }
        );

        if (!updatedMedicine) {
            console.log('Medicine not found:', id);
            return res.status(404).json({ 
                success: false, 
                message: 'Medicine not found' 
            });
        }

        console.log('Medicine updated successfully:', updatedMedicine.name, 'stock:', updatedMedicine.stock);

        res.json({
            success: true,
            message: 'Medicine stock updated successfully',
            medicine: updatedMedicine,
        });
    } catch (error) {
        console.error('Error in PATCH route:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Protected medicine routes (for admin operations)
app.use('/api/medicines', auth, medicineRoutes);



// Home Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to MediRural API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});