const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const likeMiddleware = require("../middlewares/like-middleware");
const { univBoardController } = require("../controllers");

router.post("/post", authMiddleware, univBoardController.makePost);

router.get("/post", authMiddleware, univBoardController.getPost);

router.get("/search", likeMiddleware, univBoardController.searchUnivPost);

router.get("/post/:post_id/view_count", univBoardController.getCountViewPost);

router.get("/post/:post_id", authMiddleware, univBoardController.getOnePost);

router.put("/post/:post_id", authMiddleware, univBoardController.putPost);

router.delete("/post/:post_id", authMiddleware, univBoardController.deletePost);

router.get("/post/:post_id/like", authMiddleware, univBoardController.likePost);

router.post("/comment", authMiddleware, univBoardController.makeComment);

router.get("/comment/:post_id", univBoardController.getComment);

router.put(
  "/comment/:comment_id",
  authMiddleware,
  univBoardController.putComment
);

router.delete(
  "/comment/:comment_id",
  authMiddleware,
  univBoardController.deleteComment
);

module.exports = router;
