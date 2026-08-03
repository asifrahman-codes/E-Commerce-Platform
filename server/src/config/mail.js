export default {
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
};