const express = require("express");
const { appliance, user, university, department } = require('../models');
const router = express.Router(); // 라우터라고 선언한다.

router.get("/sample", async (req, res, next) => {
    try {
        await user.create({ email: "yzkim9501@naver.com", password: "1234", phone: "010-7721-5711",realName:"김예지" });
        await university.create({siteUrl:"https://firstquarter.tistory.com/entry/TIL-20210723-항해99-47일",
        univName: "감귤대학교",
        univInfo: "귤의 모든것을 총망라한 학교",
        mapX: "8888",
        mapY: "8888",
        rank: 1,
        videoUrl: "https://www.youtube.com/watch?v=DcY2oYWyN5k",
        document: "[고등학교 영문 성적 증명서, 여권 스캔본]",
        applySAT:true,
        applyNormal:true,
        applyEnd: "2021-09-03",
        cost: "400,000,000"});
        await department.create({
          deptName: "감귤농사학과",
          deptClass: "농대",
          deptInfo: "감귤을 누구보다 맛있게 키우는 곳",
          studyTerm: "10년",
          univId:1
          })
          await appliance.create({ userId:1,univId:1,deptId:1,status:0});
        res.status(200).send("가상 데이터 생성 성공");
      } catch (err) {
        console.error(err);
        res.status(400).send(err)
      }
});

module.exports = router;
