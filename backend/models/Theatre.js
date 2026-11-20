import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    place: {
      type: String,
      required: true,
    },
    flag: {
      type: String,
      enum: ['IMAX', 'LUXE', 'DOLBY', '4K', 'STANDARD'],
      default: 'STANDARD',
    },
    amenities: {
      type: [String],
      default: ['Recliner', 'Dolby Atmos'],
    },
    times: {
      type: [String],
      default: ['10:30 AM', '1:45 PM', '5:20 PM', '9:10 PM'],
    },
    formats: {
      type: [String],
      default: ['All formats', 'IMAX', '4K'],
    },
    isSample: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Theatre = mongoose.model('Theatre', theatreSchema);
export default Theatre;
