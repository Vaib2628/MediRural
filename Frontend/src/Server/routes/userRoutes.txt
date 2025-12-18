const express = require('express')
const router = express.Router()
const User = require('../models/UserModel')
const jwt = require('jsonwebtoken')
const auth = require('../middlewares/auth')
//register route 

router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone, address } = req.body;

        // Validate required fields
        if (!email || !password || !name || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists, please login instead"
            });
        }

        // Create new user
        const user = new User(req.body);

        await user.save();

        res.status(201).json({
            success: true,
            message: "Registration successful"
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Registration failed"
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false, 
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });   
        
        res.json({
            success: true,
            token,
            message: "Login successful"
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: "An error occurred during login" 
        });
    }
});

router.get('/logout', auth, (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
    });
    res.json({ success: true, message: "Logged out successfully" });
});

// Google authentication route
router.post('/google-auth', async (req, res) => {
    try {
        const { idToken, userData } = req.body;
        
        if (!idToken || !userData) {
            return res.status(400).json({
                success: false,
                message: "Invalid Google authentication data"
            });
        }

        // Check if user already exists by Google ID
        let user = await User.findOne({ googleId: userData.googleId });
        
        if (!user) {
            // Check if user exists by email
            user = await User.findOne({ email: userData.email });
            
            if (user) {
                // User exists but doesn't have Google ID, update it
                user.googleId = userData.googleId;
                user.profilePicture = userData.profilePicture;
                await user.save();
            } else {
                // Create new user with Google data
                user = new User({
                    name: userData.name,
                    email: userData.email,
                    googleId: userData.googleId,
                    profilePicture: userData.profilePicture,
                    role: 'customer'
                });
                await user.save();
            }
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                googleId: user.googleId
            },
            message: "Google authentication successful"
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Google authentication failed"
        });
    }
});

// Route to complete Google user profile with phone number
router.post('/complete-google-profile', auth, async (req, res) => {
    try {
        console.log('Complete profile request:', { body: req.body, user: req.user });
        
        const { phone } = req.body;
        
        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.googleId) {
            return res.status(400).json({
                success: false,
                message: "This route is only for Google users"
            });
        }

        user.phone = phone;
        await user.save();

        console.log('Profile completed successfully for user:', user._id);

        res.json({
            success: true,
            message: "Profile completed successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                googleId: user.googleId
            }
        });
    } catch (error) {
        console.error('Complete profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to complete profile"
        });
    }
});

// Protected route to get user profile and check auth status
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;