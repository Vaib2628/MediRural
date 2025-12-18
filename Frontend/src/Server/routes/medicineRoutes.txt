const express = require('express');
const router = express.Router();
const Medicine = require('../models/MedicineModel');
const WrapAsync = require('../utility/WrapAsync');
const ExpressError = require('../utility/ExpressError');
const validate = require('../middlewares/validate');
const { medicineSchema } = require('../schema');
const upload = require('../middlewares/upload');

// Middleware to validate the medicine schema
const validateMedicine = (req, res, next) => {
  const { error } = medicineSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    return next(new ExpressError(400, msg));
  }
  next();
};

// Get all medicines
router.get('/', WrapAsync(async (req, res) => {
  const medicines = await Medicine.find({});
  res.json({ success: true, medicines });
}));

// Get individual medicine by ID
router.get('/:id', WrapAsync(async (req, res) => {
  const { id } = req.params;
  const medicine = await Medicine.findById(id);
  if (!medicine) {
    return res.status(404).json({ success: false, message: 'Medicine not found' });
  }
  res.json({ success: true, medicine });
}));

router.post(
  '/',
  upload.single('image'),
  WrapAsync(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.json({ success: false, message: 'Unauthorized access' });
    }

    let medicineData;
    if (req.body.medicine) {
      // Handle FormData from frontend
      medicineData = JSON.parse(req.body.medicine);
    } else {
      // Handle regular JSON data
      medicineData = req.body.medicine || req.body;
    }

    if (req.file) {
      medicineData.imageUrl = req.file.path;
    }

    const medicine = new Medicine(medicineData);
    await medicine.save();

    res.status(200).json({
      success: true,
      message: 'Medicine added successfully',
      medicine,
    });
  })
);

router.put(
  '/:id',
  upload.single('image'),
  WrapAsync(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.json({ success: false, message: 'Unauthorized access' });
    }

    const { id } = req.params;
    
    let updateData;
    if (req.body.medicine) {
      // Handle FormData from frontend
      updateData = JSON.parse(req.body.medicine);
    } else {
      // Handle regular JSON data
      updateData = req.body.medicine || req.body;
    }

    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(id, updateData, { new: true });

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      medicine: updatedMedicine,
    });
  })
);

router.delete(
  '/:id',
  WrapAsync(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.json({ success: false, message: 'Unauthorized access' });
    }

    const { id } = req.params;
    await Medicine.findByIdAndDelete(id);

    res.json({ success: true, message: 'Medicine deleted successfully' });
  })
);

module.exports = router;
