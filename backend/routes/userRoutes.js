import express from "express";
import * as userController from "../controllers/userController.js";

const router = express.Router();

// API routes for users
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;