const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // password hasing 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
      //  match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: function() {
            // Password is required only if not a Google user
            return !this.googleId;
        },
        minlength: [6, 'Password must be at least 6 characters long']
    },
    phone: {
        type: String,
        required: function() {
            // Phone is required only if not a Google user
            return !this.googleId;
        },
        trim: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    profilePicture: {
        type: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'supplier'],
        default: 'customer'
    },
    // Track order count for free medicine after 10 orders
    orderCount: {
        type: Number,
        default: 0
    },
    // Prescription information
    prescriptions: [{
        imageUrl: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verificationDate: Date,
        rejectionReason: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    // Subscription preferences
    subscriptionPreferences: {
        preferredDeliveryTime: String,
        deliveryNotes: String,
        autoRenew: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Hash password before saving   // pre middleware
userSchema.pre('save', async function(next) {
    // Skip password hashing for Google users or if password is not modified
    if (!this.isModified('password') || this.googleId) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to add prescription
userSchema.methods.addPrescription = async function(imageUrl) {
    this.prescriptions.push({
        imageUrl,
        status: 'pending'
    });
    return this.save();
};

// Method to verify prescription
userSchema.methods.verifyPrescription = async function(prescriptionId, status, adminId, rejectionReason = '') {
    const prescription = this.prescriptions.id(prescriptionId);
    if (!prescription) {
        throw new Error('Prescription not found');
    }

    prescription.status = status;
    prescription.verifiedBy = adminId;
    prescription.verificationDate = new Date();
    
    if (status === 'rejected') {
        prescription.rejectionReason = rejectionReason;
    }

    return this.save();
};

// Method to get active prescriptions
userSchema.methods.getActivePrescriptions = function() {
    return this.prescriptions.filter(p => p.status === 'approved');
};

// Static method to find users with pending prescriptions
userSchema.statics.findPendingPrescriptions = function() {
    return this.find({
        'prescriptions.status': 'pending'
    }).select('name email prescriptions');
};

// Create and export the model
const User = mongoose.model('User', userSchema);

// Export the model directly
module.exports = User; 