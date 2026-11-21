import Booking from './schemas/bookings.js';

// Escape special characters so an email can be used safely inside a RegExp.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Old bookings were saved without Mongoose, so emails may have capital letters.
// This regex matches the whole email and ignores case.
const emailMatcher = (email) => new RegExp(`^${escapeRegex(email.trim())}$`, 'i');

const getAllBookings = async () => {
    return await Booking.find({}, { _id: 0 }).sort({ createdAt: -1 }).lean();
};

const getBookingsByPassengerEmail = async (email) => {
    return await Booking.find({ 'passengers.email': emailMatcher(email) }, { _id: 0 })
        .sort({ createdAt: -1 })
        .lean();
};

const getBookingById = async (id) => {
    return await Booking.findOne({ id }, { _id: 0 }).lean();
};

const updateBookingById = async (id, changes) => {
    return await Booking.findOneAndUpdate(
        { id },
        { $set: changes },
        { returnDocument: 'after', runValidators: true, projection: { _id: 0 } }
    ).lean();
};

const deleteBookingById = async (id) => {
    const result = await Booking.deleteOne({ id });
    return result.deletedCount === 1;
};

const isPassenger = (booking, email) => {
    const matcher = emailMatcher(email);
    return (booking.passengers || []).some((passenger) => matcher.test(passenger.email || ''));
};

export {
    getAllBookings,
    getBookingsByPassengerEmail,
    getBookingById,
    updateBookingById,
    deleteBookingById,
    isPassenger
};
