const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  position: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  paymentDate: Date,
  payoutReceived: {
    type: Boolean,
    default: false
  },
  payoutDate: Date
});

const committeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Committee name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  totalSlots: {
    type: Number,
    required: [true, 'Total slots is required'],
    min: [2, 'Committee must have at least 2 slots'],
    max: [50, 'Committee cannot have more than 50 slots']
  },
  contributionAmount: {
    type: Number,
    required: [true, 'Contribution amount is required'],
    min: [1, 'Contribution amount must be greater than 0']
  },
  totalPayout: {
    type: Number,
    required: true
  },
  slots: [slotSchema],
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  currentRound: {
    type: Number,
    default: 1
  },
  category: {
    type: String,
    enum: ['Professional', 'Education', 'Community', 'Business', 'Family', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  rules: {
    type: String,
    trim: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentMethod: {
    type: String,
    enum: ['jazzcash', 'easypaisa', 'bank-transfer', 'cash'],
    default: 'jazzcash'
  },
  paymentDetails: {
    accountNumber: String,
    accountTitle: String,
    bankName: String
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

committeeSchema.virtual('availableSlots').get(function() {
  return this.slots.filter(slot => !slot.isOccupied).length;
});

committeeSchema.virtual('occupiedSlots').get(function() {
  return this.slots.filter(slot => slot.isOccupied).length;
});

committeeSchema.virtual('averageRating').get(function() {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

committeeSchema.pre('save', function(next) {
  if (this.isNew && this.slots.length === 0) {
    for (let i = 1; i <= this.totalSlots; i++) {
      this.slots.push({ position: i });
    }
  }
  next();
});

committeeSchema.methods.generateInviteCode = function() {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.inviteCode = code;
  return code;
};

module.exports = mongoose.model('Committee', committeeSchema);