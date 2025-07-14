// All comments in this file should be in English. All user-facing messages (message fields and error messages) should be in Persian.
const authService = require("./auth.service");
const createHttpError = require("http-errors");
const { User } = require("../../config/models.initial");

// Sign up
const signupHandler = async (req, res, next) => {
  try {
    await authService.signupHandler(req, res);
  } catch (err) {
    next(err);
  }
};

// Login
const loginHandler = async (req, res, next) => {
  try {
    await authService.loginHandler(req, res);
  } catch (err) {
    next(err);
  }
};

// Refresh token
const refreshHandler = async (req, res, next) => {
  try {
    await authService.refreshHandler(req, res);
  } catch (err) {
    next(err);
  }
};

// Logout
const logoutHandler = async (req, res, next) => {
  try {
    await authService.logoutHandler(req, res);
  } catch (err) {
    next(err);
  }
};

// Logout all tokens
const logoutAllHandler = async (req, res, next) => {
  try {
    await authService.logoutAllHandler(req, res);
  } catch (err) {
    next(err);
  }
};

// Get current user profile
const getProfileHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "roleId", "created_at", "updated_at"],
      include: [
        {
          model: require("../RBAC/rbac.model").Role,
          as: "role",
          attributes: ["id", "title", "description"],
        },
      ],
    });

    if (!user) {
      throw createHttpError(404, "کاربر پیدا نشد");
    }

    res.status(200).json({
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// Update profile
const updateProfileHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const name = req.body?.name;
    const email = req.body?.email;

    const user = await User.findByPk(userId);
    if (!user) {
      throw createHttpError(404, "کاربر پیدا نشد");
    }

    // Check for duplicate email (if changed)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() },
      });
      if (existingUser) {
        throw createHttpError(409, "ایمیل تکراری است");
      }
    }

    // Update profile
    await user.update({
      name: name ? name.trim() : user.name,
      email: email ? email.toLowerCase().trim() : user.email,
    });

    res.status(200).json({
      message: "پروفایل با موفقیت بروزرسانی شد",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        updated_at: user.updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Change password
const changePasswordHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const currentPassword = req.body?.currentPassword;
    const newPassword = req.body?.newPassword;
    const bcrypt = require("bcryptjs");

    if (!currentPassword || !newPassword) {
      throw createHttpError(400, "پسورد فعلی و پسورد جدید الزامی هستند");
    }

    if (newPassword.length < 6) {
      throw createHttpError(400, "پسورد جدید باید حداقل 6 کاراکتر باشد");
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "password"],
    });

    if (!user) {
      throw createHttpError(404, "کاربر پیدا نشد");
    }

    // Check current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      throw createHttpError(400, "پسورد فعلی اشتباه است");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await user.update({ password: hashedNewPassword });

    res.status(200).json({
      message: "پسورد با موفقیت تغییر یافت",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signupHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  logoutAllHandler,
  getProfileHandler,
  updateProfileHandler,
  changePasswordHandler,
};
