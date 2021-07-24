const express = require('express') //express를 쓴다
const dotenv = require('dotenv');
const app = express()
const port = 3000// port 는 3000번

dotenv.config();


const { sequelize } = require('./models');
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

sequelize.sync({ force: false }) 
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((error) => {
        console.error(error);
    });
const userRouter = require("./routers/user");
app.use("/api", [userRouter]);

app.use((req, res, next) => {
  next();
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})