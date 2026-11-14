// src/models/schemas/schedules.js
import mongoose from 'mongoose';

const DAYS_OF_WEEK = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];

// 24-hour time in HH:MM format, such as "08:30".
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const scheduleSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: 'id must be a whole number'
        }
    },
    tripId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    departureTime: {
        type: String,
        required: true,
        trim: true,
        match: [TIME_PATTERN, 'departureTime must use HH:MM (24-hour) format']
    },
    arrivalTime: {
        type: String,
        required: true,
        trim: true,
        match: [TIME_PATTERN, 'arrivalTime must use HH:MM (24-hour) format']
    },
    daysOfWeek: {
        type: [{ type: String, enum: DAYS_OF_WEEK }],
        validate: {
            validator: (days) => days.length > 0,
            message: 'daysOfWeek must include at least one day'
        }
    },
    status: {
        type: Boolean,
        default: true
    }
});

const schedule = mongoose.model('Schedule', scheduleSchema);

export default schedule;
