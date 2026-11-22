// src/controllers/dashboard.js

// Paths of the admin pages that the dashboard links to.
const BOOKING_ADMIN_PATH = '/admin/bookings';
const USER_ADMIN_PATH = '/admin/users';

/**
 * EJS controller: renders the standard user dashboard.
 * The bookings list is loaded by the browser from the API, so nothing is queried here.
 */
const dashboardPage = (req, res) => {
    return res.render('dashboard', {
        title: 'My Dashboard',
        bookingAdminPath: BOOKING_ADMIN_PATH,
        userAdminPath: USER_ADMIN_PATH
    });
};

export { dashboardPage };
