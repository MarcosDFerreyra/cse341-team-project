import {
    getAllBookings,
    getBookingsByPassengerEmail,
    getBookingById,
    updateBookingById,
    deleteBookingById,
    isPassenger
} from '../models/bookings.js';
import { User } from '../models/schemas/users.js';
import { TICKET_CLASSES, DAYS_OF_WEEK, MAX_PASSENGERS } from '../models/schemas/bookings.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isAdmin = (req) => req.user?.role === 'admin';

// The session only has the user id, name and role. We read the email from the
// database, so it is always the current email of the signed-in user.
const getSessionEmail = async (req) => {
    const user = await User.findById(req.user.id).select('email').lean();
    return user ? user.email : null;
};

// Check the PUT body and keep only the fields a user is allowed to change.
const validateBookingChanges = (body = {}) => {
    const errors = [];
    const changes = {};

    if (body.ticketClass !== undefined) {
        if (!TICKET_CLASSES.includes(body.ticketClass)) {
            errors.push(`ticketClass must be one of: ${TICKET_CLASSES.join(', ')}`);
        } else {
            changes.ticketClass = body.ticketClass;
        }
    }

    if (body.selectedDay !== undefined) {
        const day = String(body.selectedDay).toLowerCase();
        if (!DAYS_OF_WEEK.includes(day)) {
            errors.push('selectedDay must be a day of the week, for example monday');
        } else {
            changes.selectedDay = day;
        }
    }

    if (body.passengers !== undefined) {
        const list = body.passengers;
        if (!Array.isArray(list) || list.length < 1 || list.length > MAX_PASSENGERS) {
            errors.push(`passengers must be a list of 1 to ${MAX_PASSENGERS} passengers`);
        } else {
            changes.passengers = list.map((passenger, index) => {
                const firstName = String(passenger?.firstName ?? '').trim();
                const lastName = String(passenger?.lastName ?? '').trim();
                const email = String(passenger?.email ?? '').trim().toLowerCase();
                const phone = String(passenger?.phone ?? '').trim();

                if (!firstName) errors.push(`passengers[${index}].firstName is required`);
                if (!lastName) errors.push(`passengers[${index}].lastName is required`);
                if (!EMAIL_PATTERN.test(email)) errors.push(`passengers[${index}].email must be a valid email`);

                return { firstName, lastName, email, phone };
            });
        }
    }

    if (errors.length === 0 && Object.keys(changes).length === 0) {
        errors.push('Send at least one field to update: ticketClass, selectedDay or passengers');
    }

    return { errors, changes };
};

// Load a booking and check that the signed-in user may change it.
// Returns { booking } when allowed, or { status, error } when not.
const loadBookingForChange = async (req) => {
    const booking = await getBookingById(req.params.id);
    if (!booking) {
        return { status: 404, error: 'Booking not found' };
    }
    if (isAdmin(req)) {
        return { booking };
    }
    const email = await getSessionEmail(req);
    if (!email || !isPassenger(booking, email)) {
        return { status: 403, error: 'You can only change bookings where you are a passenger' };
    }
    return { booking };
};

const getBookingsApi = async (req, res) => {
    try {
        if (isAdmin(req)) {
            return res.status(200).json(await getAllBookings());
        }
        const email = await getSessionEmail(req);
        if (!email) {
            return res.status(200).json([]);
        }
        return res.status(200).json(await getBookingsByPassengerEmail(email));
    } catch (error) {
        console.error('GET /api/bookings failed:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const updateBookingApi = async (req, res) => {
    const { errors, changes } = validateBookingChanges(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ error: 'Invalid booking data', details: errors });
    }

    try {
        const access = await loadBookingForChange(req);
        if (access.error) {
            return res.status(access.status).json({ error: access.error });
        }
        const updated = await updateBookingById(req.params.id, changes);
        return res.status(200).json(updated);
    } catch (error) {
        console.error(`PUT /api/bookings/${req.params.id} failed:`, error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteBookingApi = async (req, res) => {
    try {
        const access = await loadBookingForChange(req);
        if (access.error) {
            return res.status(access.status).json({ error: access.error });
        }
        await deleteBookingById(req.params.id);
        return res.status(204).end();
    } catch (error) {
        console.error(`DELETE /api/bookings/${req.params.id} failed:`, error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const bookingAdminPage = (req, res) => {
    return res.render('admin/bookings', {
        title: 'Booking Admin',
        isAdminUser: isAdmin(req),
        ticketClasses: TICKET_CLASSES,
        daysOfWeek: DAYS_OF_WEEK
    });
};

export { getBookingsApi, updateBookingApi, deleteBookingApi, bookingAdminPage, validateBookingChanges };
