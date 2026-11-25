// src/models/bookings.js
import Booking from './schemas/bookings.js';
import { getAllTrips } from './trips.js';

// Compare emails without caring about upper or lower case.
const CASE_INSENSITIVE = { locale: 'en', strength: 2 };

/**
 * Gets the bookings where one of the passengers has the given email, newest first.
 * Only the fields the dashboard needs are returned, so other passengers' details stay private.
 *
 * @param {string} email - The email address to look for.
 * @returns {Promise<Array>} The matching bookings (empty if there are none).
 */
const getBookingsByPassengerEmail = async (email) => {
    const bookings = await Booking
        .find({ 'passengers.email': email })
        .collation(CASE_INSENSITIVE)
        .sort({ createdAt: -1 })
        .lean();

    if (bookings.length === 0) {
        return [];
    }

    const trips = await getAllTrips();
    const tripNames = new Map(trips.map((trip) => [trip.id, trip.name]));

    return bookings.map((booking) => ({
        id: booking.id,
        tripId: booking.tripId,
        tripName: tripNames.get(booking.tripId) ?? booking.tripId,
        ticketClass: booking.ticketClass,
        selectedDay: booking.selectedDay,
        passengerCount: booking.passengers.length,
        createdAt: booking.createdAt
    }));
};

export { getBookingsByPassengerEmail };
