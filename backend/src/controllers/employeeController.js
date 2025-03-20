const User = require('../models/User');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');

// @desc    Clock in
// @route   POST /api/employee/attendance/clock-in
// @access  Private/Employee
const clockIn = async (req, res) => {
    try {
        const { coordinates } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already clocked in today
        const existingAttendance = await Attendance.findOne({
            userId: req.user._id,
            date: today
        });

        if (existingAttendance && existingAttendance.clockIn) {
            return res.status(400).json({
                success: false,
                message: 'Already clocked in today'
            });
        }

        const attendance = existingAttendance || new Attendance({
            userId: req.user._id,
            date: today
        });

        attendance.clockIn = {
            time: new Date(),
            location: {
                type: 'Point',
                coordinates
            }
        };

        await attendance.save();

        res.json({
            success: true,
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Clock out
// @route   POST /api/employee/attendance/clock-out
// @access  Private/Employee
const clockOut = async (req, res) => {
    try {
        const { coordinates, taskReports } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            userId: req.user._id,
            date: today
        });

        if (!attendance || !attendance.clockIn) {
            return res.status(400).json({
                success: false,
                message: 'No clock-in record found for today'
            });
        }

        if (attendance.clockOut) {
            return res.status(400).json({
                success: false,
                message: 'Already clocked out today'
            });
        }

        attendance.clockOut = {
            time: new Date(),
            location: {
                type: 'Point',
                coordinates
            }
        };

        // Add task reports if provided
        if (taskReports && taskReports.length > 0) {
            attendance.tasks = taskReports;
        }

        await attendance.save();

        res.json({
            success: true,
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get employee tasks
// @route   GET /api/employee/tasks
// @access  Private/Employee
const getEmployeeTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update task status
// @route   PUT /api/employee/tasks/:id
// @access  Private/Employee
const updateTaskStatus = async (req, res) => {
    try {
        const { status, totalHours, feedback } = req.body;
        const task = await Task.findOne({
            _id: req.params.id,
            assignedTo: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        task.status = status || task.status;
        if (totalHours) task.totalHours = totalHours;
        if (feedback) task.feedback = feedback;

        await task.save();

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Submit resignation request
// @route   POST /api/employee/resign
// @access  Private/Employee
const submitResignation = async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.user._id);

        if (user.status === 'resigned') {
            return res.status(400).json({
                success: false,
                message: 'Already submitted resignation'
            });
        }

        user.status = 'resigned';
        user.resignDate = new Date();
        user.resignReason = reason;

        await user.save();

        res.json({
            success: true,
            message: 'Resignation submitted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get balance
// @route   GET /api/employee/balance
// @access  Private/Employee
const getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('balance');
        res.json({
            success: true,
            data: {
                balance: user.balance
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Request balance withdrawal
// @route   POST /api/employee/balance/withdraw
// @access  Private/Employee
const requestWithdrawal = async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.user._id);

        if (amount > user.balance) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        user.balance -= amount;
        await user.save();

        res.json({
            success: true,
            message: 'Withdrawal successful',
            data: {
                withdrawnAmount: amount,
                remainingBalance: user.balance
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get attendance history
// @route   GET /api/employee/attendance
// @access  Private/Employee
const getAttendanceHistory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { userId: req.user._id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .sort({ date: -1 });

        res.json({
            success: true,
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    clockIn,
    clockOut,
    getEmployeeTasks,
    updateTaskStatus,
    submitResignation,
    getBalance,
    requestWithdrawal,
    getAttendanceHistory
};