const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  role:Joi.string().default("user"),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().optional(),
  preferences: Joi.object({
    currency: Joi.string().optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional()
    }).optional(),
    privacy: Joi.object({
      profileVisibility: Joi.string().valid('everyone', 'committee-members', 'private').optional()
    }).optional()
  }).optional()
});

// Expense validation schemas
const expenseSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  amount: Joi.number().positive().required(),
  category: Joi.string().min(1).max(100),
  type: Joi.string().valid('expense', 'income').default('expense'),
  date: Joi.date().optional(),
  description: Joi.string().max(500).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isRecurring: Joi.boolean().default(false),
  recurringFrequency: Joi.string()
    .valid('daily', 'weekly', 'monthly', 'yearly')
    .when('isRecurring', { is: true, then: Joi.required(), otherwise: Joi.optional() })
});

// Committee validation schemas
const committeeSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  totalSlots: Joi.number().integer().min(2).max(50).required(),
  contributionAmount: Joi.number().positive().required(),
  startDate: Joi.date().min('now').required(),
  category: Joi.string().valid('Professional', 'Education', 'Community', 'Business', 'Family', 'Other').default('Other'),
  description: Joi.string().max(500).optional(),
  rules: Joi.string().optional(),
  isPrivate: Joi.boolean().default(false),
  paymentMethod: Joi.string().valid('jazzcash', 'easypaisa', 'bank-transfer', 'cash').default('jazzcash'),
  paymentDetails: Joi.object({
    accountNumber: Joi.string().optional(),
    accountTitle: Joi.string().optional(),
    bankName: Joi.string().optional()
  }).optional()
});

const joinCommitteeSchema = Joi.object({
  slotPosition: Joi.number().integer().min(1).required()
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  expenseSchema,
  committeeSchema,
  joinCommitteeSchema
};