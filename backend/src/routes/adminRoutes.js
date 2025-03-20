const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getJobApplications,
    processJobApplication,
    getEmployees,
    updateEmployee,
    createTask,
    getAllTasks,
    processResignation,
    getEmployeeAttendance,
    updateTaskPayment
} = require('../controllers/adminController');

// All routes are protected and require admin role
router.use(protect, admin);

// Job application routes
router.get('/applications', getJobApplications);
router.put('/applications/:id', processJobApplication);

// Employee management routes
router.get('/employees', getEmployees);
router.put('/employees/:id', updateEmployee);
router.get('/attendance/:employeeId', getEmployeeAttendance);

// Task management routes
router.route('/tasks')
    .post(createTask)
    .get(getAllTasks);
router.put('/tasks/:id/payment', updateTaskPayment);

// Resignation management
router.put('/resignations/:id', processResignation);

module.exports = router;