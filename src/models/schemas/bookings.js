import mongoose from 'mongoose';

export const TICKET_CLASSES = ['standard', 'premium', 'first'];
export const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const MAX_PASSENGERS = 8;

const passengerSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true }
    },
    { _id: false }
);

// Bookings are saved by the booking form in the "confirmations" collection,
// so this model reads and writes that same collection.
const bookingSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true, trim: true },
        createdAt: { type: String },
        scheduleId: { type: String },
        tripId: { type: String },
        ticketClass: { type: String, enum: TICKET_CLASSES },
        selectedDay: { type: String, enum: DAYS_OF_WEEK },
        passengers: {
            type: [passengerSchema],
            validate: {
                validator: (list) => list.length >= 1 && list.length <= MAX_PASSENGERS,
                message: `A booking needs 1 to ${MAX_PASSENGERS} passengers`
            }
        }
    },
    {
        collection: 'confirmations',
        versionKey: false,
        toJSON: {
            transform: (doc, ret) => {
                delete ret._id;
                return ret;
            }
        }
    }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
