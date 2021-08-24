const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const { electionController } = require("../controllers");

router.post("/", authMiddleware, electionController.postElection);

router.get("/", authMiddleware, electionController.getElectionList);

router.get("/:election_id", authMiddleware, electionController.getElection);

router.put("/:election_id", authMiddleware, electionController.putElection);

router.delete("/:election_id", authMiddleware, electionController.delElection);

router.post("/vote/:election_id", authMiddleware, electionController.doVote);

router.get(
  "/:election_id/result",
  authMiddleware,
  electionController.voteResult
);

router.post("/comment", authMiddleware, electionController.makeComment);

router.get("/comment/:election_id", electionController.getComment);

router.put(
  "/comment/:comment_id",
  authMiddleware,
  electionController.putComment
);

router.delete(
  "/comment/:comment_id",
  authMiddleware,
  electionController.deleteComment
);

module.exports = router;
