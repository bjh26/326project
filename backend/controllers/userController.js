import { userModel } from "../models/userModel.js";

// Create a new user
export const createUser = async (req, res) => {
    try {
        const profile = req.body;
        
        // Check if email already exists
        if (await userModel.findOne({ where: { email: profile.email } }) !== null) {
            return res.status(400).json({ error: "A profile with this email already exists." });
        }
        
        await userModel.create({
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            bio: profile.bio,
            resume: profile.resume,
            department: profile.department,
            mime: profile.mime,
            pfp: profile.pfp,
            resume: profile.resume
        });
        
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};

// Get user by ID (email)
export const getUserById = async (req, res) => {
    try {
        const id = req.params.id; // using email as id
        const userProfile = await userModel.findOne({ where: { email: id } });
        
        if (userProfile) {
            res.json(userProfile);
        } else {
            res.status(404).json({ message: "User not found." });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Error fetching user", error: error.message });
    }
};

// Update user information
export const updateUser = async (req, res) => {
    try {
        const id = req.params.id; // using email as id
        const updatedProfile = req.body;
        
        const findProfile = await userModel.findOne({ where: { email: id } });
        if (findProfile === null) {
            return res.status(404).json({ message: "User not found" });
        }
        
        await findProfile.update({
            firstName: updatedProfile.firstName,
            lastName: updatedProfile.lastName,
            email: updatedProfile.email,
            bio: updatedProfile.bio,
            img: updatedProfile.profileImage,
            resume: updatedProfile.resume
        });
        
        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        
        const findProfile = await userModel.findOne({ where: { email: id } });
        if (findProfile === null) {
            return res.status(404).json({ message: "User not found" });
        }
        
        await findProfile.destroy();
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};