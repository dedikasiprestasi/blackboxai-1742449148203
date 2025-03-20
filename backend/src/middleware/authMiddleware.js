const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                throw new Error('User not found');
            }

            if (req.user.status !== 'active' && req.user.role !== 'applicant') {
                return res.status(401).json({
                    success: false,
                    message: 'Account is not active'
                });
            }

            next();
        } else {
            res.status(401).json({
                success: false,
                message: 'Not authorized, no token'
            });
        }
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({
            success: false,
            message: 'Not authorized as admin'
        });
    }
};

const employee = (req, res, next) => {
    if (req.user && req.user.role === 'employee') {
        next();
    } else {
        res.status(401).json({
            success: false,
            message: 'Not authorized as employee'
        });
    }
};

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = {
    protect,
    admin,
    employee,
    generateToken
};