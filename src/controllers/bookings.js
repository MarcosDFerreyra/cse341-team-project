// src/controllers/bookings.js
import { getBookingsByPassengerEmail } from '../models/bookings.js';
import { findUserById } from '../models/users.js';

/**
 * API controller: returns the bookings for the signed-in user.
 * The email comes from the user's account, never from the request, so users cannot ask for other people's bookings.
 */
const getMyBookings = async (req, res) => {
    try {
        const user = await findUserById(req.user.id);

        if (!user) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        const bookings = await getBookingsByPassengerEmail(user.email);

        return res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);

        return res.status(500).json({
            error: 'Failed to fetch bookings'
        });
    }
};

export { getMyBookings };
