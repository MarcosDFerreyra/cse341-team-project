
import {
    createUser,
    findUserByEmail,
    verifyPassword,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from "../models/users.js";

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
    const { email, password, } = req.body;
    try {
        if (!email || !password)
            return res.status(400).render("login", { title: "Login", error: "Invalid email or password" });
        const user = await findUserByEmail(email.toLowerCase());
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
        return res.redirect("/");
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

// Get users according to the current user's role.
const getUsers = async (req, res, next) => {
    try {
        if (req.user.role === "admin") {
            const users = await getAllUsers();
            return res.status(200).json(users);
        }

        const user = await getUserById(req.user.id);

        if (!user)
            return res.status(404).json({ message: "User not found" });

        return res.status(200).json([user]);
    } catch (error) {
        return next(error);
    }
};

// Update a user's own account or an account managed by an admin.
const updateUserAccount = async (req, res, next) => {
    try {
        const isAdmin = req.user.role === "admin";
        const isOwner = req.user.id === req.params.id;

        if (!isAdmin && !isOwner)
            return res.status(403).json({ message: "Forbidden" });

        const { display_name, username, email } = req.body;
        const updates = {};

        if (display_name !== undefined) updates.display_name = display_name;
        if (username !== undefined) updates.username = username;
        if (email !== undefined) updates.email = email.toLowerCase();

        if (Object.keys(updates).length === 0)
            return res.status(400).json({ message: "No valid fields provided" });

        const updatedUser = await updateUser(req.params.id, updates);

        if (!updatedUser)
            return res.status(404).json({ message: "User not found" });

        return res.status(200).json(updatedUser);
    } catch (error) {
        if (error.code === 11000)
            return res.status(400).json({ message: "Username or email already exists" });
        return next(error);
    }
};

// Delete a user's own account or an account managed by an admin.
const deleteUserAccount = async (req, res, next) => {
    try {
        const isAdmin = req.user.role === "admin";
        const isOwner = req.user.id === req.params.id;

        if (!isAdmin && !isOwner)
            return res.status(403).json({ message: "Forbidden" });

        const deletedUser = await deleteUser(req.params.id);

        if (!deletedUser)
            return res.status(404).json({ message: "User not found" });

        // End the session when a user deletes their own account.
        if (isOwner) {
            return req.session.destroy((error) => {
                if (error) return next(error);
                return res.status(200).json({ message: "Account deleted successfully" });
            });
        }

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        return next(error);
    }
};

export {
    register,
    login,
    logout,
    getUsers,
    updateUserAccount,
    deleteUserAccount
};
