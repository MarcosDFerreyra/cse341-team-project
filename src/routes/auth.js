
import { Router } from 'express';
import { register, login, logout } from '../controllers/users.js';
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
    res.render("admin", { title: "Admin Dashboard" })
});

// Protected users page
authRouter.get('/admin/users', requirePageLogin, (req, res) => {
    res.render('users', {
        title: 'User Management',
        currentUserId: req.user.id
    });
});

export default authRouter;
