// src/models/schemas/bookings.js
// Bookings are saved by the booking form in the "confirmations" collection.
import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true }
    },
    { _id: false }
);

const bookingSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        createdAt: {
            type: String // ISO date string, as saved by the booking form
        },
        scheduleId: {
            type: String
        },
        tripId: {
            type: String,
            required: true,
            trim: true
        },
        ticketClass: {
            type: String,
            required: true,
            trim: true
        },
        selectedDay: {
            type: String,
            required: true,
            trim: true
        },
        passengers: {
            type: [passengerSchema],
            default: []
        }
    },
    {
        collection: 'confirmations',
        versionKey: false
    }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
