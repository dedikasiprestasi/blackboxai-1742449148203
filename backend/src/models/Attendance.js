const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    clockIn: {
        time: Date,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    },
    clockOut: {
        time: Date,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    },
    workingHours: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'half_day'],
        default: 'present'
    },
    notes: String,
    tasks: [{
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        },
        hoursSpent: Number,
        description: String
    }]
}, {
    timestamps: true
});

// Index for location-based queries
attendanceSchema.index({ 'clockIn.location': '2dsphere' });
attendanceSchema.index({ 'clockOut.location': '2dsphere' });

// Calculate working hours when clock out
attendanceSchema.pre('save', function(next) {
    if (this.clockIn && this.clockOut) {
        const hours = (this.clockOut.time - this.clockIn.time) / (1000 * 60 * 60);
        this.workingHours = parseFloat(hours.toFixed(2));

        // Determine attendance status based on company policy
        // Example: If clock in is after 9 AM, mark as late
        const clockInHour = new Date(this.clockIn.time).getHours();
        if (clockInHour >= 9) {
            this.status = 'late';
        }

        // If working hours less than 4, mark as half day
        if (this.workingHours < 4) {
            this.status = 'half_day';
        }
    }
    next();
});

// Virtual for total task hours
attendanceSchema.virtual('totalTaskHours').get(function() {
    return this.tasks.reduce((total, task) => total + (task.hoursSpent || 0), 0);
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;