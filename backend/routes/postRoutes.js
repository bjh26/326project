import express from "express";
import * as postController from "../controllers/postController.js";

const router = express.Router();

// Special routes
router.get("/count", postController.getPostCount);
router.get("/majors/all", postController.getAllMajors);
router.get("/updates/stream", postController.getUpdates);

// API routes for research posts
router.get("/", postController.getAllPosts);
router.get("/:id", postController.getPostById);
router.post("/", postController.createPost);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);

export default router;