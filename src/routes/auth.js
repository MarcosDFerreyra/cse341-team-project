import { Router } from 'express';
import { register, login, logout } from '../controllers/users.js';
import { dashboardPage } from '../controllers/dashboard.js';
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

// standard user dashboard
authRouter.get('/dashboard', requirePageLogin, dashboardPage);

// admin routes
authRouter.get("/admin", requirePageRole("admin"), (req, res) => {
    res.render("admin", {title: "Admin Dashboard"})
})

export default authRouter;