const { default: mongoose } = require("mongoose");


const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is not a valid status`,
      },
      default: "interested",
    },
    message: {
      type: String,
      maxLength: 500,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests between same two users
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

// Prevent sending request to self
connectionRequestSchema.pre("save", function (next) {
  if (this.fromUserId.equals(this.toUserId)) {
    return next(new Error("Cannot send connection request to yourself!"));
  }
  next();
});


export const ConnectionRequest = mongoose.model("ConnectionRequest",connectionRequestSchema)
