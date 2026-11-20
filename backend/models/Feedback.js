import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ['feedback', 'support'],
      default: 'feedback',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userName: {
      type: String,
      trim: true,
      default: '',
    },
    ticketCode: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: [
        'A little feedback',
        'Something went well',
        'An idea for CinéRegal',
        'Help with a booking',
        'Booking issue',
        'Refund request',
        'Account access',
        'Technical issue',
        'Other',
      ],
      default: 'A little feedback',
    },
    note: {
      type: String,
      required: [true, 'Feedback note is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'open', 'in_progress', 'reviewed', 'resolved'],
      default: 'open',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
