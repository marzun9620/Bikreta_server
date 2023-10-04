//const taskModel = require('../models/taskModel');

// Fetch tasks
const getTask = async (req, res) => {
    try {
        const data = await taskModel.find({});
        
        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, message: "No tasks found" });
        }

        return res.json({ success: true, data: data });
        
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// Insert into database
const saveTask1 = async (req, res) => {
    try {
        const data = new taskModel(req.body);
        await data.save();
        res.send({ success: true, data: data });
        console.log(req.body);
    } catch (error) {
        console.error("Error saving tasks:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update data
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTask = await taskModel.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.send({ success: true, data: updatedTask });
    } catch (error) {
        console.error("Error updating tasks:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTask = await taskModel.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.send({ success: true, message: "Deleted Successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    getTask,
    saveTask1,
    updateTask,
    deleteTask
};
