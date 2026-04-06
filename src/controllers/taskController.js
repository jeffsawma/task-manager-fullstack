const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");

// Defining how Mongoose should popullate related user data for 'userId' and 'assignedUserId'
const taskPopulate = [
  { path: "userId", select: "_id name email" },
  { path: "assignedUserId", select: "_id name email" },
];

const resolvedAssignedUserId = async (assignedUserId) => {
  if (assignedUserId === undefined) {
    return undefined;
  }

  if (assignedUserId === null || assignedUserId === "") {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(assignedUserId)) {
    return { error: "Invalid assigned user id" };
  }

  const assignedUser = await User.findById(assignedUserId).select("_id");
  if (!assignedUser) {
    return { error: "Assigned user not found" };
  }

  return assignedUser._id; // If found, return the assignedUser
};

const createTask = async (req, res) => {
  try {
    const { title, description, done, priority, assignedUserId } = req.body;

    if (!req.user || !req.user.id) {
      // user.id from authMiddleware
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!title) {
      // Required per instructions
      return res.status(400).json({ message: "Title is required" });
    }

    const resolvedAssignedUser = await resolvedAssignedUserId(assignedUserId);
    if (resolvedAssignedUser && resolvedAssignedUser.error) {
      return res.status(400).json({ message: resolvedAssignedUser.error });
    }

    const task = await Task.create({
      title,
      description,
      done,
      priority,
      userId: req.user.id,
      assignedUserId: resolvedAssignedUser,
    });
    await task.populate(taskPopulate);

    return res.status(201).json({
      message: "Task created successfully",
      data: { task },
    });
  } catch (error) {
    console.error("CREATE TASK ERROR:", error); // For testing purposes
    return res.status(500).json({ message: "Error while creating task" });
  }
};

const getTasks = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unautorized" });
    }

    const tasks = await Task.find({
      $or: [{ userId: req.user.id }, { assignedUserId: req.user.id }],
    })
      .populate(taskPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Tasks fetched successfully",
      data: { tasks },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error while fetching tasks" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params; // Retrieving the id of task the user wants to delete

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Task Id" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Convert 'userId' that comes from db to String
    if (task.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the task owner can delete this task" });
    }

    await task.deleteOne();

    return res.status(200).json({
      message: "Task deleted successfully",
      data: {
        task,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error while fetching tasks" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, done, priority, assignedUserId } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Task Id" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isOwner = task.userId.toString() === req.user.id;
    const isAssignedUser =
      task.assignedUserId && task.assignedUserId.toString() === req.user.id;

    if (!isOwner && !isAssignedUser) {
      return res.status(403).json({
        message: "Only the task owner and assigned user can update this task",
      });
    }

    const updatePayload = {};

    if ("done" in req.body) {
      updatePayload.done = done;
    }

    if (isOwner) {
      if ("title" in req.body) {
        updatePayload.title = title;
      }

      if ("description" in req.body) {
        updatePayload.description = description;
      }

      if ("priority" in req.body) {
        updatePayload.priority = priority;
      }

      const resolvedAssignedUser = await resolvedAssignedUserId(assignedUserId);

      if (resolvedAssignedUser && resolvedAssignedUser.error) {
        return res.status(400).json({ message: resolvedAssignedUser.error });
      }

      if (resolvedAssignedUser !== undefined) {
        updatePayload.assignedUserId = resolvedAssignedUser;
      }
    }

    const updateTask = await Task.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    }).populate(taskPopulate);

    return res.status(200).json({
      message: "Task updated successfully",
      data: {
        task: updateTask,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error while updating task" });
  }
};

module.exports = {
  createTask,
  getTasks,
  deleteTask,
  updateTask,
};
