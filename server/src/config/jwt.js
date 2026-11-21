export default {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN,

  refreshSecret:
    process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET,
  refreshExpiresIn:
    process.env.JWT_REFRESH_EXPIRES_IN ||
    process.env.REFRESH_TOKEN_EXPIRES_IN,
};