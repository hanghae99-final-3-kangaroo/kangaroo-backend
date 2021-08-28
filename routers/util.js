const express = require("express");
const router = express.Router(); // 라우터라고 선언한다.

const { utilController } = require("../controllers");
const likeMiddleware = require("../middlewares/like-middleware");
const imgUploader = require("../middlewares/img-uploader");

const schedule = require("node-schedule");

router.post("/image", imageUploader.single("img"), async (req, res) => {
  try {
    res.status(200).send({
      ok: true,
      result: req.file.filename,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
});

router.post("/bulk-image", imageUploader.array("img"), async (req, res) => {
  try {
    result = [];
    for (file of req.files) {
      result.push(file.filename);
    }
    res.status(200).send({
      ok: true,
      result,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
});

router.get("/search", likeMiddleware, utilController.searchPost);

router.get("/nickname", utilController.searchNickname);

// 02 : 00 시 마다 갱신하며 불필요한 이미지 처리
schedule.scheduleJob("0 0 2 * * *", async function () {
  console.log(new Date().toJSON() + " 마다 삭제!");
  await utilController.cleanUp();
});

module.exports = router;
