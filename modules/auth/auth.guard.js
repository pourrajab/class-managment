require("dotenv").config();
const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");
const { User } = require("../../config/models.initial");

async function AuthGuard(req, res, next) {
  try {
    const authorization = req.headers?.authorization ?? undefined;
    if (!authorization)
      throw createHttpError(401, "لطفاً وارد حساب کاربری خود شوید");
    const [bearer, token] = authorization?.split(" ");
    if (!bearer || bearer?.toLowerCase() !== "bearer") {
      throw createHttpError(401, "لطفاً وارد حساب کاربری خود شوید");
    }
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    if (verified?.id) {
      const user = await User.findByPk(verified?.id);
      if (!user) throw createHttpError(401, "لطفاً وارد حساب کاربری خود شوید");
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
      };
      return next();
    }
    throw createHttpError(401, "لطفاً وارد حساب کاربری خود شوید");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  AuthGuard,
};
