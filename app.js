const express = require("express"); // express를 쓴다
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const routers = require("./routers");
const app = express();
const fs = require("fs");
const passportConfig = require("./passport");
const http = require("http");
const https = require("https");
const env = process.env.NODE_ENV;
const logger = require("morgan")("dev");

dotenv.config();
app.set("port", process.env.PORT || 3000);

const cors = require("cors");
app.use(cors({ origin: true, credentials: true }));

const { sequelize } = require("./models");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output");

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));

sequelize
  .sync({ force: false })
  .then(() => {
    console.log(`
    🐣 🐣 🐣 🐣 🐣 🐣 🐣
    🐤 안 녕 🐤 디 비 🐤 
    🐥 🐥 🐥 🐥 🐥 🐥 🐥
    `);
  })
  .catch((error) => {
    console.error(error);
  });
passportConfig();
app.use(
  session({ secret: "secret key", resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));

app.use(logger);
app.use(routers);

app.get("/", (req, res) => {
  res.send("Hello, Kangaroo");
});

http.createServer(app).listen(3000);
if (env == "prd") {
  const options = {
    ca: fs.readFileSync(process.env.HTTPS_CA),
    key: fs.readFileSync(process.env.HTTPS_KEY),
    cert: fs.readFileSync(process.env.HTTPS_CERT),
  };
  https.createServer(options, app).listen(443);
}

module.exports = app;
