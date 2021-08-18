const express = require("express");
const router = express.Router(); // 라우터라고 선언한다.
const authMiddleware = require("../middlewares/auth-middleware");
const { userController } = require("../controllers");

router.post("/user", userController.makeUser);

router.get("/user/my-post", authMiddleware, userController.getMyPost);

router.get("/user/my-comment", authMiddleware, userController.getMyComment);

router.get("/user/:user_id", authMiddleware, userController.getUserInfo);

router.put("/user/:user_id", authMiddleware, userController.updateUserInfo);

router.delete("/user/:user_id", authMiddleware, userController.deleteUserInfo);

router.get("/is-admin", authMiddleware, userController.checkAdmin);

router.post("/admin", authMiddleware, userController.changeAdmin);

module.exports = router;
