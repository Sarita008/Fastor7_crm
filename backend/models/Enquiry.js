const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide client name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide client email'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide client phone number'],
      trim: true
    },
    courseInterest: {
      type: String,
      required: [true, 'Please specify the course or program of interest'],
      trim: true
    },
    message: {
      type: String,
      default: ''
    },
    // Pricing / Package tier matching itempage.png styling
    preferredTier: {
      type: String,
      enum: ['Standard', 'Personal (4 Weeks)', 'Medium (8 Weeks)', 'Familiar (10 Weeks)', 'Jumbo (12 Weeks)'],
      default: 'Medium (8 Weeks)'
    },
    estimatedValue: {
      type: Number,
      default: 20.00
    },
    status: {
      type: String,
      enum: ['unclaimed', 'claimed', 'contacted', 'in_review', 'enrolled', 'closed'],
      default: 'unclaimed'
    },
    // Claiming logic
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    claimedByEmail: {
      type: String,
      default: null
    },
    claimedAt: {
      type: Date,
      default: null
    },
    notes: [
      {
        note: { type: String, required: true },
        author: { type: String, default: 'Counselor' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    source: {
      type: String,
      default: 'Website Form'
    }
  },
  {
    timestamps: true
  }
);

// Index for high-performance querying
EnquirySchema.index({ status: 1, claimedBy: 1 });
EnquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Enquiry', EnquirySchema);

