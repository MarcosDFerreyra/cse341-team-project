import { Role } from "./schemas/roles.js";
import { User } from "./schemas/users.js";
import bcrypt from "bcrypt";

const createUser = async(display_name, username, email, password) => {
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

const findUserById = async (id) => {
    return await User.findById(id);
};

const verifyPassword = async (password, password_hash) => {
    return bcrypt.compare(password, password_hash);
}
export {
    createUser, findUserByEmail, findUserById, verifyPassword};