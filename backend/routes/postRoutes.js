import express from "express";
import * as postController from "../controllers/postController.js";

const router = express.Router();

// API routes for research posts
router.get("/", postController.getAllPosts);
router.get("/:id", postController.getPostById);
router.post("/", postController.createPost);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);

// Special routes
router.get("/majors/all", postController.getAllMajors);
router.get("/updates/stream", postController.getUpdates);

export default router;