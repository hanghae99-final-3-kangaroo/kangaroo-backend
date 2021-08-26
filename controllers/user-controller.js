const bcrypt = require("bcrypt");
const Joi = require("joi");
const { userService } = require("../services");
const Listener = require("../src/Listener");
const MailSender = require("../src/MailSender");

const postUserModel = Joi.object({
  email: Joi.string().email().required(),
  nickname: Joi.string().min(2).max(20).required(),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9~!@#$%^&*()_+-=,./?]{4,30}$"))
    .required(),
});

const makeUser = async (req, res, next) => {
  try {
    const { email, password, nickname } = await postUserModel.validateAsync(
      req.body
    );
    const provider = "local";
    const dupEmail = await userService.findUser({ email });

    if (!password) {
      res.status(403).send({
        ok: false,
        message: "패스워드 미입력",
      });
      return;
    }
    if (dupEmail) {
      res.status(403).send({
        ok: false,
        message: "이메일 중복",
      });
      return;
    }
    const dupNick = await userService.findUser({ nickname });
    if (dupNick) {
      res.status(403).send({
        ok: false,
        message: "닉네임 중복",
      });
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await userService.createUser({
      email,
      password: hashedPassword,
      nickname,
      provider,
    });

    const mailSender = new MailSender();
    const listener = new Listener(mailSender);
    listener.listen({
      targetEmail: email,
      type: "welcome",
      authCode: "0",
    });
    res.status(200).send({
      ok: true,
      result: createdUser,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 회원가입 실패`,
    });
  }
};

const getMyPost = async (req, res) => {
  const { user_id } = res.locals.user;
  // const user_id = 1;
  const { pageSize, pageNum } = req.query;
  if (!pageSize || !pageNum) {
    res.status(403).send({
      message: "pageSize, pageNum을 입력하세요.",
      ok: false,
    });
    return;
  }
  let offset = 0;
  if (pageNum > 1) {
    offset = pageSize * (pageNum - 1);
  }
  try {
    const my_free_post = await userService.getLikesFromPosts(
      "free",
      user_id,
      await userService.findPosts("free", { user_id }, false)
    );
    const my_univ_post = await userService.getLikesFromPosts(
      "univ",
      user_id,
      await userService.findPosts("univ", { user_id }, false)
    );
    let my_posts = userService
      .concatenateArray(my_free_post, my_univ_post)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    const totalPage = Math.ceil(my_posts["countPage"] / pageSize);
    my_posts = my_posts.slice(offset, Number(offset) + Number(pageSize));
    res.status(200).send({
      ok: true,
      my_posts,
      totalPage,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 유저 정보 조회 실패`,
    });
  }
};

const getMyComment = async (req, res) => {
  const { user_id } = res.locals.user;
  // const user_id = 1;
  const { pageSize, pageNum } = req.query;
  if (!pageSize || !pageNum) {
    res.status(403).send({
      message: "pageSize, pageNum을 입력하세요.",
      ok: false,
    });
    return;
  }
  let offset = 0;
  if (pageNum > 1) {
    offset = pageSize * (pageNum - 1);
  }
  try {
    const my_free_comment = await userService.getLikesFromPosts(
      "free",
      user_id,
      await userService.findComments("free", user_id)
    );
    const my_univ_comment = await userService.getLikesFromPosts(
      "univ",
      user_id,
      await userService.findComments("univ", user_id)
    );
    let my_comments = userService.concatenateComment(
      my_free_comment,
      my_univ_comment
    );
    my_comments.forEach(function (c) {
      c.comment = {};
      c.comment.createdAt = c["comment_createdAt"];
      c.comment.content = c["comment_content"];
      delete c["comment_createdAt"];
      delete c["comment_content"];
    });
    my_comments.sort(
      (a, b) =>
        new Date(b.comment.createdAt).getTime() -
        new Date(a.comment.createdAt).getTime()
    );
    const totalPage = Math.ceil(my_comments["countPage"] / pageSize);
    my_comments = my_comments.slice(offset, Number(offset) + Number(pageSize));
    res.status(200).send({
      ok: true,
      my_comments,
      totalPage,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 유저 정보 조회 실패`,
    });
  }
};

const getUserInfo = async (req, res) => {
  const { user_id } = req.params;
  try {
    if (res.locals.user.user_id != user_id) {
      res.status(401).send({
        ok: false,
        message: "Unauthorized",
      });
      return;
    }
    const myInfo = await userService.findUser({ user_id });
    res.status(200).send({
      ok: true,
      result: myInfo,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 유저 정보 조회 실패`,
    });
  }
};

const updateUserInfo = async (req, res) => {
  const { user_id } = req.params;

  const { email, password, nickname, new_password } = req.body;

  try {
    if (res.locals.user.user_id != user_id) {
      res.status(401).send({
        ok: false,
        message: "Unauthorized",
      });
      return;
    }

    const user_check = await userService.findUser({ user_id });
    if (password != undefined) {
      const authenticate = await bcrypt.compare(password, user_check.password);

      if (!authenticate) {
        res.status(401).send({
          ok: false,
          message: "비밀번호가 틀렸습니다.",
        });
        return;
      }

      if (!password) {
        res.status(403).send({
          ok: false,
          message: "패스워드 미입력",
        });
        return;
      }
    }

    if (email != undefined) {
      const dupEmail = await userService.findUser({ email });
      if (dupEmail) {
        res.status(403).send({
          ok: false,
          message: "이메일 중복",
        });
        return;
      }
    }

    if (nickname != undefined) {
      const dupNickname = await userService.findUser({ nickname });

      if (dupNickname) {
        res.status(403).send({
          ok: false,
          message: "닉네임 중복",
        });
        return;
      }
    }

    if (!email && !nickname && !new_password) {
      res.status(403).send({
        ok: false,
        message: "수정할 정보 입력이 없습니다.",
      });
      return;
    }

    let user_info_update = {};
    if (email) user_info_update.email = email;
    if (nickname) user_info_update.nickname = nickname;
    if (new_password) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(new_password, salt);
      user_info_update.password = hashedPassword;
    }

    await userService.updateTarget(user_check, user_info_update);

    res.status(200).send({
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 유저 정보 업데이트 실패`,
    });
  }
};

const deleteUserInfo = async (req, res) => {
  const { user_id } = req.params;
  try {
    if (res.locals.user.user_id != user_id) {
      res.status(401).send({
        ok: false,
        message: "Unauthorized",
      });
      return;
    }

    await userService.delUser(user_id);

    res.status(200).send({
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 탈퇴 실패`,
    });
  }
};

const checkAdmin = async (req, res) => {
  const { user_id } = res.locals.user;

  try {
    const checkAdmin = await userService.findUniv({
      admin_id: user_id,
    });
    res.status(200).send({
      ok: true,
      result: checkAdmin,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 관리자 변경 실패`,
    });
  }
};

const changeAdmin = async (req, res) => {
  const { user_id } = res.locals.user;
  const { target_user_id } = req.body;

  try {
    const targetUser = await userService.findUser({
      user_id: target_user_id,
    });

    if (targetUser == null) {
      res.status(403).send({
        ok: false,
        message: "존재하지 않는 유저입니다.",
      });
      return;
    }

    const targetUniv = await userService.findUniv({
      admin_id: user_id,
    });

    if (!targetUniv) {
      res.status(403).send({
        ok: false,
        message: "관리자 권한 없음",
      });
      return;
    }

    if (targetUser.univ_id != targetUniv.univ_id) {
      res.status(403).send({
        ok: false,
        message: "변경을 원하는 관리자가 해당 대학에 재학중이지 않음",
      });
      return;
    }

    await userService.updateTarget(targetUniv, { admin_id: target_user_id });

    const resultUniv = await userService.findUniv({
      univ_id: targetUniv.univ_id,
    });

    res.status(200).send({
      ok: true,
      result: resultUniv,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 관리자 변경 실패`,
    });
  }
};

module.exports = {
  makeUser,
  getMyPost,
  getMyComment,
  getUserInfo,
  updateUserInfo,
  deleteUserInfo,
  checkAdmin,
  changeAdmin,
};
