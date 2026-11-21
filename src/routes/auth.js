import { Router } from 'express';
import { register, login, logout } from '../controllers/users.js';
import { bookingAdminPage } from '../controllers/bookings.js';
import {
    requireApiLogin,
    requireApiRole,
    requirePageLogin,
    requirePageRole
} from '../middleware/auth.js';

const authRouter = Router();


//register - login -logout routes
authRouter.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});
authRouter.get('/login', (req, res) => {
    res.render('login', { title: 'Login' })
});

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

// admin routes
authRouter.get("/admin", requirePageRole("admin"), (req, res) => {
    res.render("admin", {title: "Admin Dashboard"})
})

// Booking admin page: any signed-in user. Admins see all bookings,
// customers see only their own (the API decides which bookings to send).
authRouter.get('/admin/bookings', requirePageLogin, bookingAdminPage);

export default authRouter;