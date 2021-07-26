const express = require("express");
const { user,university,country, vote, free_board, free_comment, univ_board, univ_comment } = require('../models');
const router = express.Router(); // 라우터라고 선언한다.

router.post('/user', async(req, res)=>{
    const{ email, password, nickname }= req.body;
    try{
        const createdUser=await user.create({
            email, password, nickname
        });
        res.status(200).send({
          'ok': true,
          result: createdUser,
        })
    } catch (err) {
        console.error(err);
        res.status(400).send({
          'ok': false,
          message: `${err}`,
        })
      }
});

router.get("/user/:user_id", async (req, res, next) => {
    const {user_id}=req.params;
    try {
        const myInfo = await user.findOne({
            where:{ user_id },
            include: [
                { model: university, attributes: ["name"] },
                { model: country, attributes: ["name"] }
            ],
            });
        res.status(200).send({
          'ok': true,
          result: myInfo,
        })
      } catch (err) {
        console.error(err);
        res.status(400).send({
          'ok': false,
          message: `${err}`,
        })
      }
});

router.put('/user/:user_id', async(req, res)=>{
    const {user_id}=req.params;
    const{ email, password, nickname }= req.body;
    try{
        await user.update({
            email, password, nickname
        }, {
            where:{user_id}
        });
        res.status(200).send({
          'ok': true
        })
    } catch (err) {
        console.error(err);
        res.status(400).send({
          'ok': false,
          message: `${err}`,
        })
      }
});

router.delete('/user/:user_id', async(req, res)=>{
    const {user_id}=req.params;
    try{
        await free_board.destroy({
            where:{user_id}
        });
        await free_comment.destroy({
            where:{user_id}
        });
        await univ_board.destroy({
            where:{user_id}
        });
        await univ_comment.destroy({
            where:{user_id}
        });
        await vote.destroy({
            where:{user_id}
        });
        await user.destroy({
            where:{user_id}
        });
        res.status(200).send({
          'ok': true
        })
    } catch (err) {
        console.error(err);
        res.status(400).send({
          'ok': false,
          message: `${err}`,
        })
      }
});

module.exports = router;
