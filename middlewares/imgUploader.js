const multer = require("multer");
const randomstring = require("randomstring");

module.exports = imageUploader = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `${__dirname}/../public`); //저장할 폴더
    },
    filename: (req, file, cb) => {
      var fileName = randomstring.generate(25); // 파일 이름 - 랜덤
      var mimeType;
      switch (
        file.mimetype // 파일 타입
      ) {
        case "image/jpeg":
          mimeType = "jpg";
          break;
        case "image/png":
          mimeType = "png";
          break;
        case "image/gif":
          mimeType = "gif";
          break;
        case "image/bmp":
          mimeType = "bmp";
          break;
        default:
          mimeType = "jpg";
          break;
      }
      cb(null, fileName + "." + mimeType); // 파일 이름 + 파일 타입 형태로 이름 설정
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 크기제한 : 5byte
  },
});
