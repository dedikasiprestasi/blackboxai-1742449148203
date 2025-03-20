const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nik: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'employee', 'applicant'],
        default: 'applicant'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'rejected'],
        default: 'pending'
    },
    level: {
        type: Number,
        default: 1
    },
    balance: {
        type: Number,
        default: 0
    },
    phoneNumber: String,
    education: String,
    experience: String,
    joinDate: Date,
    lastActive: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;