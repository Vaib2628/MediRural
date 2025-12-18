const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Medicine name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    manufacturer: {
        type: String,
        required: [true, 'Manufacturer name is required'],
        trim: true
    },
    expiryDate: {
        type: Date,
        required: [true, 'Expiry date is required']
    },
    prescriptionRequired: {
        type: Boolean,
        default: false
    },
    imageUrl: {
        type: String,
        default: 'default-medicine.jpg'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for text search
medicineSchema.index({ name: 'text', category: 'text', manufacturer: 'text' });

// Instance methods
medicineSchema.methods.isInStock = function () {
    return this.stock > 0;
};

medicineSchema.methods.isExpired = function () {
    return new Date() > this.expiryDate;
};

// Static methods
medicineSchema.statics.findByCategory = function (category) {
    return this.find({ category, isActive: true });
};

medicineSchema.statics.findPrescriptionRequired = function () {
    return this.find({ prescriptionRequired: true, isActive: true });
};

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
