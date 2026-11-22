
import { createUser, findUserByEmail, verifyPassword } from "../models/users.js";
import { getDashboardPath } from "../includes/helpers.js";

const register = async (req, res, next) => {
    const { display_name, username, email, password } = req.body
    try {
        if (!display_name || !username || !email || !password)
            return res.status(400).render("register", { title: 'Register', error: 'field missing' });
            await createUser(display_name, username, email, password);
        return res.redirect("/login")
    }
    catch (error) {
        if (error.code === 11000)
            return res.status(400).render("register", { title: 'Register', error: "That email has been used" }); 
        return next(error);
    }    
} 

const login = async (req, res, next) => {
    const { email, password,  } = req.body;
    try {
        if (!email || !password)
            return res.status(400).render("login", { title: "Login", error: "Invalid email or password" });
        const user= await findUserByEmail(email.toLowerCase());
        if (!user)
            return res.render("login", { title: "Login", error: "invalid email" });
        const valid_password = await verifyPassword(password, user.passwordHash);
        if (!valid_password)
            return res.render("login", { title: "Login", error: "invalid password" });
        req.session.user = {
            id: user._id.toString(),
            display_name: user.display_name,
            role: user.role.name
        };
        return res.redirect(getDashboardPath(user.role.name));
    } catch (error) {
        return next(error);
    }
}

const logout = async (req, res, next) => {
    req.session.destroy((error) => {
        if (error) return next(error);
        return res.redirect('/login');
    });
}
export {register, login, logout}