import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      min: 18,
      max: 65,
      required: true,
    },
    socialSecurityNumber: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['worker', 'employer'],
      default: 'worker',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    education: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    companyDescription: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
