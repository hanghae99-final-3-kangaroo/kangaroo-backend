const express = require("express");
const router = express.Router(); // 라우터라고 선언한다.

const { utilController } = require("../controllers");
const likeMiddleware = require("../middlewares/like-middleware");
const imgUploader = require("../middlewares/img-uploader");

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

module.exports = router;
