require("dotenv").config();
const { User, RefreshToken } = require("../../config/models.initial");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN;

// Generate refresh token
const generateRefreshToken = async (userId, req) => {
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  // Save refresh token in database
  await RefreshToken.create({
    token: refreshToken,
    userId: userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
  });

  return refreshToken;
};

// Signup handler
const signupHandler = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;
    if (!name || !email || !password || !roleId) {
      return res.status(400).json({ message: "اطلاعات ناقص است" });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "کاربر قبلاً ثبت‌نام کرده است" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, roleId });
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
    });
  } catch (err) {
    res.status(500).json({ message: "خطای سرور", error: err.message });
  }
};

// Login handler
const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "ایمیل و پسورد الزامی است" });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "کاربر یافت نشد" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "پسورد اشتباه است" });
    }

    // Generate access token
    const accessToken = jwt.sign(
      { id: user.id, roleId: user.roleId },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    // Generate refresh token
    const refreshToken = await generateRefreshToken(user.id, req);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "خطای سرور", error: err.message });
  }
};

// Refresh token handler
const refreshHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "رفرش توکن الزامی است" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // Check refresh token existence in database
    const tokenRecord = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        isRevoked: false,
        expiresAt: { [require("sequelize").Op.gt]: new Date() },
      },
    });

    if (!tokenRecord) {
      return res.status(401).json({ message: "رفرش توکن نامعتبر است" });
    }

    // Get user info
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "کاربر یافت نشد" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: user.id, roleId: user.roleId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
      },
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "رفرش توکن نامعتبر است" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "رفرش توکن منقضی شده است" });
    }
    res.status(500).json({ message: "خطای سرور", error: err.message });
  }
};

// Logout handler
const logoutHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      // Revoke refresh token
      await RefreshToken.update(
        { isRevoked: true },
        { where: { token: refreshToken } }
      );
    }
    res.json({ message: "خروج موفقیت‌آمیز بود" });
  } catch (err) {
    res.status(500).json({ message: "خطای سرور", error: err.message });
  }
};

// Logout all user tokens handler
const logoutAllHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    // Revoke all tokens for user
    await RefreshToken.update(
      { isRevoked: true },
      { where: { userId, isRevoked: false } }
    );
    res.json({ message: "تمام توکن‌ها لغو شدند" });
  } catch (err) {
    res.status(500).json({ message: "خطای سرور", error: err.message });
  }
};

module.exports = {
  signupHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  logoutAllHandler,
};
