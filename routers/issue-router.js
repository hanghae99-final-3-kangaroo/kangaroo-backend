const express = require("express");
const router = express.Router();
const { issueController } = require("../controllers");

const schedule = require("node-schedule");

schedule.scheduleJob("31 8 * * * *", async function () {
  console.log(new Date().toJSON() + " 마다 갱신");
  await issueController.createIssue();
});

router.get("/", issueController.getIssue);

module.exports = router;
