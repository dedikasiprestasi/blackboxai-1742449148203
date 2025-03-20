const express = require('express');
const router = express.Router();
const { protect, employee } = require('../middleware/authMiddleware');
const {
    clockIn,
    clockOut,
    getEmployeeTasks,
    updateTaskStatus,
    submitResignation,
    getBalance,
    requestWithdrawal,
    getAttendanceHistory
} = require('../controllers/employeeController');

// All routes are protected and require employee role
router.use(protect, employee);

// Attendance routes
router.post('/attendance/clock-in', clockIn);
router.post('/attendance/clock-out', clockOut);
router.get('/attendance', getAttendanceHistory);

// Task routes
router.get('/tasks', getEmployeeTasks);
router.put('/tasks/:id', updateTaskStatus);

// Resignation route
router.post('/resign', submitResignation);

// Balance routes
router.get('/balance', getBalance);
router.post('/balance/withdraw', requestWithdrawal);

module.exports = router;