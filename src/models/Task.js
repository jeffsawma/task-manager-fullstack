const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // Required
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    done: {
      type: Boolean,
      default: false, // Task is not done by default
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium", // Priority is medium by default
    },
    userId: {
      // Creator of a task
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // User
      required: true, // Required
    },
    assignedUserId: {
      // User assigned to a task
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Task is not assigned to a user by default
    },
  },
  {
    timestamps: true,
  },
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
