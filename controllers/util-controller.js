const { userService, boardService, utilService } = require("../services");

const fs = require("fs");
const path = require("path");
const appDir = path.dirname(require.main.filename);

const searchPost = async (req, res, next) => {
  try {
    const { pageSize, pageNum, category, country_id, sort } = req.query;

    let user_id, univSearch;
    if (res.locals.user !== null) {
      user_id = res.locals.user.user_id;
    }
    if (!pageSize || !pageNum) {
      res.status(403).send({
        message: "pageSize, pageNum을 입력하세요.",
        ok: false,
      });
      return;
    }

    let { keyword } = req.query;
    keyword = keyword.trim();

    if (!keyword.length) {
      return res.status(400).json("invalid target");
    }
    keyword = keyword.replace(/\s\s+/gi, " ");

    let offset = 0;
    if (pageNum > 1) {
      offset = pageSize * (pageNum - 1);
    }

    const freeSearch = await boardService.getLikesFromPosts(
      "free",
      user_id,
      await boardService.findAllPost(
        "free",
        10000,
        0,
        category,
        keyword,
        true, // search
        country_id,
        null //univ_id
      ),
      sort,
      keyword
    );

    if (user_id !== undefined) {
      const user = await userService.findUser({ user_id });

      univSearch = await boardService.getLikesFromPosts(
        "univ",
        user_id,
        await boardService.findAllPost(
          "univ",
          10000,
          0,
          category,
          keyword,
          true, // search
          null, // country_id
          user.univ_id
        ),
        sort,
        keyword
      );
    }

    let result = userService
      .concatenateArray(freeSearch, univSearch)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    const totalPage = Math.ceil(result["countPage"] / pageSize);
    result = result.slice(offset, Number(offset) + Number(pageSize));

    res.status(200).send({
      result,
      totalPage,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 게시글 조회 실패`,
    });
  }
};

// 닉네임 중복 검사
const searchNickname = async (req, res, next) => {
  try {
    const { nickname } = req.body;

    const dupNick = await userService.findUser({ nickname });

    if (dupNick) {
      res.status(403).send({
        ok: false,
        message: "닉네임 중복",
      });
      return;
    }

    res.status(200).send({
      ok: true,
      message: "닉네임 사용 가능!",
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 닉네임 조회 실패`,
    });
  }
};

// 불필요한 이미지 삭제
const cleanUp = async (req, res, next) => {
  try {
    const freeImages = await utilService.findAllPost("free");
    const univImages = await utilService.findAllPost("univ");
    const candidateImages = await utilService.findAllCandidate();

    const useImages = freeImages.concat(univImages, candidateImages);

    const publicFolder = "./public/";
    const savedImages = fs.readdirSync(publicFolder);

    const findDeleteImg = savedImages.filter(
      (x) => !useImages.includes("/" + x)
    );

    for (let i = 0; i < findDeleteImg.length; i++) {
      fs.unlinkSync(appDir + "/public/" + findDeleteImg[i]);
      console.log(`${findDeleteImg[i]} 삭제 되었습니다.`);
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  searchPost,
  searchNickname,
  cleanUp,
};
