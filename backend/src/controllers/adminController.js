const User = require('../models/User');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');

// @desc    Get all job applications
// @route   GET /api/admin/applications
// @access  Private/Admin
const getJobApplications = async (req, res) => {
    try {
        const applications = await User.find({ 
            role: 'applicant',
            status: 'pending'
        }).select('-password');

        res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Process job application
// @route   PUT /api/admin/applications/:id
// @access  Private/Admin
const processJobApplication = async (req, res) => {
    try {
        const { status, level } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (status === 'approved') {
            user.role = 'employee';
            user.status = 'active';
            user.level = level || 1;
            user.joinDate = new Date();
        } else {
            user.status = 'inactive';
        }

        await user.save();

        res.json({
            success: true,
            message: `Application ${status}`,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all employees
// @route   GET /api/admin/employees
// @access  Private/Admin
const getEmployees = async (req, res) => {
    try {
        const employees = await User.find({ 
            role: 'employee'
        }).select('-password');

        res.json({
            success: true,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update employee data
// @route   PUT /api/admin/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res) => {
    try {
        const { level, status } = req.body;
        const employee = await User.findById(req.params.id);

        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        if (level) employee.level = level;
        if (status) employee.status = status;

        await employee.save();

        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new task
// @route   POST /api/admin/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            assignedTo,
            priority,
            paymentType,
            paymentAmount,
            startDate,
            dueDate
        } = req.body;

        const task = await Task.create({
            title,
            description,
            assignedTo,
            assignedBy: req.user._id,
            priority,
            paymentType,
            paymentAmount,
            startDate,
            dueDate
        });

        res.status(201).json({
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

// @desc    Get all tasks
// @route   GET /api/admin/tasks
// @access  Private/Admin
const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'name email nik')
            .populate('assignedBy', 'name')
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

// @desc    Process resignation request
// @route   PUT /api/admin/resignations/:id
// @access  Private/Admin
const processResignation = async (req, res) => {
    try {
        const { status } = req.body;
        const employee = await User.findById(req.params.id);

        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        if (status === 'approved') {
            employee.status = 'inactive';
        } else {
            employee.status = 'active';
            employee.resignDate = undefined;
            employee.resignReason = undefined;
        }

        await employee.save();

        res.json({
            success: true,
            message: `Resignation ${status}`,
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get employee attendance report
// @route   GET /api/admin/attendance/:employeeId
// @access  Private/Admin
const getEmployeeAttendance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { userId: req.params.employeeId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .populate('userId', 'name email nik')
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

// @desc    Update task payment
// @route   PUT /api/admin/tasks/:id/payment
// @access  Private/Admin
const updateTaskPayment = async (req, res) => {
    try {
        const { paymentAmount, paymentType } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        task.paymentAmount = paymentAmount || task.paymentAmount;
        task.paymentType = paymentType || task.paymentType;

        await task.save();

        // Update employee balance if task is completed
        if (task.status === 'completed') {
            const employee = await User.findById(task.assignedTo);
            employee.balance += task.totalPayment;
            await employee.save();
        }

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

module.exports = {
    getJobApplications,
    processJobApplication,
    getEmployees,
    updateEmployee,
    createTask,
    getAllTasks,
    processResignation,
    getEmployeeAttendance,
    updateTaskPayment
};