const {
  makeUser,
  changeAdmin,
  getUserInfo,
  updateUserInfo,
  deleteUserInfo,
  checkAdmin,
} = require("../controllers/user-controller");

describe("makeUser", () => {
  const req = {
    body: { email: "yzkim9501@naver.com", password: "1234", nickname: "Pray" },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  test("회원가입 완료 후  200 응답", async () => {
    await makeUser(req, res);
    expect(res.send).toBeCalledWith(200);
  });
  test("닉네임 중복시 403 응답", async () => {
    req.body.email = "kimyj950113@gmail.com";
    await makeUser(req, res);
    expect(res.send).toBeCalledWith(403);
  });
  test("이메일 중복시 403 응답", async () => {
    req.body.email = "yzkim9501@naver.com";
    req.body.nickname = "Pray2";
    await makeUser(req, res);
    expect(res.send).toBeCalledWith(403);
  });
  test("테스트용 회원2 생성", async () => {
    req.body.email = "kimyj950113@gmail.com";
    await makeUser(req, res);
    expect(res.send).toBeCalledWith(200);
  });
});

describe("getUserInfo", () => {
  const req = {
    params: {
      user_id: 1,
    },
  };
  const res = {
    locals: { user: { user_id: 1 } },
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  test("정상 회원 정보 조회시 200 응답", async () => {
    await getUserInfo(req, res);
    expect(res.send).toBeCalledWith(200);
  });
  test("본인 정보 조회가 아니면 401 응답", async () => {
    res.locals.user.user_id = 3;
    await getUserInfo(req, res);
    expect(res.send).toBeCalledWith(401);
  });
});

describe("updateUserInfo", () => {
  const req = {
    params: {
      user_id: 1,
    },
    body: {},
  };
  const res = {
    locals: { user: { user_id: 1 } },
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  test("수정할 정보가 없으면 403 응답", async () => {
    res.locals.user.user_id = 3;
    await updateUserInfo(req, res);
    expect(res.send).toBeCalledWith(401);
  });
  test("본인 정보 수정이 아니면 401 응답", async () => {
    res.locals.user.user_id = 3;
    await updateUserInfo(req, res);
    expect(res.send).toBeCalledWith(401);
  });
  test("비밀번호 미입력시 403 응답", async () => {
    res.locals.user.user_id = 1;
    await updateUserInfo(req, res);
    expect(res.send).toBeCalledWith(403);
  });
  test("비밀번호가 틀렸으면 401 응답", async () => {
    req.body.password = "123";
    await updateUserInfo(req, res);
    expect(res.send).toBeCalledWith(401);
  });
  test("이메일 중복시 403 응답", async () => {
    req.body.password = "1234";
    req.body.email = "kimyj950113@gmail.com";
    await updateUserInfo(req, res);
    expect(res.send).toBeCalledWith(403);
  });
  test("닉네임 중복시 403 응답", async () => {
    req.body.email = "yzkim9501@naver.com";
    req.body.nickname = "Pray2";
    await updateUserInfo(req, res);
    expect(res.send).toBeCalledWith(403);
  });
  test("정상 회원 정보 수정시 200 응답", async () => {
    req.body.email = "test@naver.com";
    req.body.nickname = "Pray3";
    await updateUserInfo(req, res);
    expect(res.send).toBeCalledWith(200);
  });
});

describe("checkAdmin", () => {
  const res = {
    locals: { user: { user_id: 1 } },
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  test("정상 회원 관리자 조회시 200 응답", async () => {
    await checkAdmin(req, res);
    expect(res.send).toBeCalledWith(200);
  });
});

describe("deleteUserInfo", () => {
  const req = {
    params: {
      user_id: 1,
    },
  };
  const res = {
    locals: { user: { user_id: 1 } },
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  test("본인 정보 삭제가 아니면 401 응답", async () => {
    res.locals.user.user_id = 3;
    await deleteUserInfo(req, res);
    expect(res.send).toBeCalledWith(401);
  });

  test("정상 회원 정보 삭제시 200 응답", async () => {
    await deleteUserInfo(req, res);
    expect(res.send).toBeCalledWith(200);
  });
  test("테스트용 회원 정보 삭제", async () => {
    req.params.user_id = 2;
    res.locals.user.user_id = 2;
    await deleteUserInfo(req, res);
    expect(res.send).toBeCalledWith(200);
  });
});

// describe("changeAdmin", () => {
//   const req = {
//     body: { target_user_id: 2 },
//   };
//   const res = {
//     locals: { user: { user_id: 1 } },
//     status: jest.fn(() => res),
//     send: jest.fn(),
//   };
// });
