const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    paymentType: {
        type: String,
        enum: ['hourly', 'fixed'],
        required: true
    },
    paymentAmount: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    completedDate: Date,
    totalHours: {
        type: Number,
        default: 0
    },
    totalPayment: {
        type: Number,
        default: 0
    },
    feedback: String,
    attachments: [{
        fileName: String,
        fileUrl: String,
        uploadedAt: Date
    }]
}, {
    timestamps: true
});

// Calculate total payment before saving
taskSchema.pre('save', function(next) {
    if (this.status === 'completed' && !this.completedDate) {
        this.completedDate = new Date();
    }

    if (this.paymentType === 'hourly') {
        this.totalPayment = this.totalHours * this.paymentAmount;
    } else {
        this.totalPayment = this.paymentAmount;
    }
    
    next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;