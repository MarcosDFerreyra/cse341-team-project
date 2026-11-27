
import { Role } from "./schemas/roles.js";
import { User } from "./schemas/users.js";
import bcrypt from "bcrypt";

const createUser = async (display_name, username, email, password) => {
    const customer_role = await Role.findOne({ name: "customer" });
    if (!customer_role)
        throw new Error("Default role not found");
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await User.create({
        display_name,
        username,
        email,
        passwordHash,
        role: customer_role._id
    });
    return newUser._id.toString()
};

const findUserByEmail = async (email) => {
    return await User.findOne({ email }).populate("role");
}

const verifyPassword = async (password, password_hash) => {
    return bcrypt.compare(password, password_hash);
}

// Get all users without exposing their password hashes.
const getAllUsers = async () => {
    return await User.find()
        .select("-passwordHash")
        .populate("role", "name");
};

// Get one user by ID without exposing their password hash.
const getUserById = async (userId) => {
    return await User.findById(userId)
        .select("-passwordHash")
        .populate("role", "name");
};

// Update a user.
const updateUser = async (userId, updates) => {
    return await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
    )
        .select("-passwordHash")
        .populate("role", "name");
};

// Delete a user.
const deleteUser = async (userId) => {
    return await User.findByIdAndDelete(userId);
};

export {
    createUser,
    findUserByEmail,
    verifyPassword,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
