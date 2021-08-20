require("dotenv").config();
const env = process.env;

const development = {
  username: env.DB_USER,
  password: env.DB_PW,
  database: env.DB_NAME,
  host: env.DB_HOST,
  dialect: "mysql",
  timezone: "+09:00",
  define: {
    freezeTableName: true,
  },
  logging: false,
  dialectOptions: {
    charset: "utf8mb4",
    dateStrings: true,
    typeCast: true,
  },
};

const production = {
  username: env.DB_USER,
  password: env.DB_PW,
  database: env.DB_NAME,
  host: env.DB_HOST,
  dialect: "mysql",
  timezone: "+09:00",
  define: {
    freezeTableName: true,
  },
  logging: false,
  dialectOptions: {
    charset: "utf8mb4",
    dateStrings: true,
    typeCast: true,
  },
};

const test = {
  username: env.DB_USER,
  password: env.DB_PW,
  database: env.DB_NAME + "_test",
  host: env.DB_HOST,
  dialect: "mysql",
  timezone: "+09:00",
  define: {
    freezeTableName: true,
  },
  logging: true,
  dialectOptions: {
    charset: "utf8mb4",
    dateStrings: true,
    typeCast: true,
  },
};

module.exports = { development, production, test };
