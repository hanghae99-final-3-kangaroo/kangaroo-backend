const {
  userService,
  freeBoardService,
  univBoardService,
} = require("../services");

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

    const freeSearch = await freeBoardService.getLikesFromPosts(
      user_id,
      await freeBoardService.findAllPost(
        pageSize,
        offset,
        category,
        country_id,
        keyword,
        "search"
      ),
      sort,
      keyword
    );
    if (user_id !== undefined) {
      univSearch = await univBoardService.getLikesFromPosts(
        user_id,
        await univBoardService.findAllPost(
          pageSize,
          offset,
          category,
          country_id,
          keyword,
          "search"
        ),
        sort,
        keyword
      );
    }
    res.status(200).send({
      result: userService.concatenateArray(freeSearch, univSearch),
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
module.exports = {
  searchPost,
};
