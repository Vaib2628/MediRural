const Joi = require('joi');

const medicineSchema = Joi.object({
  medicine: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    stock: Joi.number().required().min(0),
    category: Joi.string().required(),
    manufacturer: Joi.string().required(),
    expiryDate: Joi.date().iso().required(),
    prescriptionRequired: Joi.boolean().optional(),
    imageUrl: Joi.string().required(), 
    isActive: Joi.boolean().optional()
  }).required()
});

module.exports.medicineSchema = medicineSchema;
