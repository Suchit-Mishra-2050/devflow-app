import mongoose from "mongoose";

const taskActivitySchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "CREATED",
        "UPDATED",
        "STATUS_CHANGED",
        "ASSIGNED",
        "UNASSIGNED",
        "DELETED",
        "RESTORED",
      ],
      required: true,
    },

    details: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

taskActivitySchema.index({
  task: 1,
  createdAt: -1,
});

const taskActivityModel = mongoose.model("TaskActivity", taskActivitySchema);

export default taskActivityModel;
