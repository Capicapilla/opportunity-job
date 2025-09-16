import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewed: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 1000, default: "" }
  },
  { timestamps: true }
);

// Evita que la misma persona deje varias reviews al mismo trabajo
reviewSchema.index({ job: 1, reviewer: 1, reviewed: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
