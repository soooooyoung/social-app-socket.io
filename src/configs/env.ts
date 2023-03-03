import * as dotenv from "dotenv";
dotenv.config();
export const env = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  app: {
    port: Number(process.env.PORT) || 9000,
  },
  utils: {
    JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET,
    ENCRYPT_KEY_SECRET: process.env.ENCRYPT_KEY_SECRET,
    API_KEY_SECRET: process.env.API_KEY_SECRET,
  },
  db: {
    DB_HOST: process.env.MY_SQL_DB_HOST,
    DB_USER: process.env.MY_SQL_DB_USER,
    DB_PASSWORD: process.env.MY_SQL_DB_PASSWORD,
    DB_PORT: process.env.MY_SQL_DB_PORT,
    DB_DATABASE: process.env.MY_SQL_DB_DATABASE,
    DB_CONNECTION_LIMIT: process.env.MY_SQL_DB_CONNECTION_LIMIT
      ? parseInt(process.env.MY_SQL_DB_CONNECTION_LIMIT)
      : 4,
  },
  email: {
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_AUTH_USER: process.env.EMAIL_AUTH_USER,
    EMAIL_AUTH_PASS: process.env.EMAIL_AUTH_PASS,
  },
  client: process.env.CLIENT,
  path: {
    userImg: process.env.IMG_PATH_USER,
    postImg: process.env.IMG_PATH_POST,
  },
};
