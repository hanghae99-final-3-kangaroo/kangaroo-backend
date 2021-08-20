const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const likeMiddleware = require("../middlewares/like-middleware");
const { freeBoardController } = require("../controllers");

router.post("/post", authMiddleware, freeBoardController.makePost);

router.get("/post", likeMiddleware, freeBoardController.getPost);

router.get("/search", likeMiddleware, freeBoardController.searchFreePost);

router.get("/post/:post_id/view_count", freeBoardController.getCountViewPost);

router.get("/post/:post_id", likeMiddleware, freeBoardController.getOnePost);

router.put("/post/:post_id", authMiddleware, freeBoardController.putPost);

router.delete("/post/:post_id", authMiddleware, freeBoardController.deletePost);

router.get("/post/:post_id/like", authMiddleware, freeBoardController.likePost);

router.post("/comment", authMiddleware, freeBoardController.makeComment);

router.get("/comment/:post_id", freeBoardController.getComment);

router.put(
  "/comment/:comment_id",
  authMiddleware,
  freeBoardController.putComment
);

router.delete(
  "/comment/:comment_id",
  authMiddleware,
  freeBoardController.deleteComment
);

module.exports = router;
