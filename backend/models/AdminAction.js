import mongoose from 'mongoose';

const adminActionSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entity: {
      type: String,
      required: true,
      enum: ['movie', 'review', 'support', 'booking'],
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

adminActionSchema.index({ createdAt: -1 });

export default mongoose.model('AdminAction', adminActionSchema);
