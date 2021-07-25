const express = require("express");
const { appliance, user, university, department } = require('../models');
const router = express.Router(); // 라우터라고 선언한다.

router.get("/apply", async (req, res, next) => {
    try {
        const apply = await appliance.findAll({
            include: [
                { model: user, attributes: ["realName"] },
                { model: university, attributes: ["univName"] },
                { model: department, attributes: ["deptName"] }],
            order: [
            ['status', 'ASC']
        ]});
        res.status(200).send({
          'ok': true,
          result: apply,
        })
      } catch (err) {
        console.error(err);
        res.status(400).send({
          'ok': false,
          message: `${err} : 지원자 조회 실패`,
        })
      }
});

module.exports = router;
