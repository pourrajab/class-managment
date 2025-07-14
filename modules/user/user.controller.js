const { User } = require("./user.model");
const createHttpError = require("http-errors");

// Get all users
const getAllUsersHandler = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "roleId", "created_at", "updated_at"],
      include: [
        {
          model: require("../RBAC/rbac.model").Role,
          as: "role",
          attributes: ["id", "title", "description"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.status(200).json({
      data: users,
      count: users.length,
    });
  } catch (err) {
    next(err);
  }
};

// Get user by id
const getUserByIdHandler = async (req, res, next) => {
  try {
    const id = req.params?.id;
    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه کاربر نامعتبر است");
    }
    const user = await User.findByPk(id, {
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

// Create a new user
const createUserHandler = async (req, res, next) => {
  try {
    const name = req.body?.name;
    const email = req.body?.email;
    const roleId = req.body?.roleId;
    if (!name || !email || !roleId) {
      throw createHttpError(400, "نام، ایمیل و نقش الزامی هستند");
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw createHttpError(409, "کاربر قبلاً ثبت شده است");
    }
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      roleId,
    });
    res.status(201).json({
      message: "کاربر با موفقیت ایجاد شد",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Update user
const updateUserHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, roleId } = req.body;
    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه کاربر نامعتبر است");
    }
    const user = await User.findByPk(id);
    if (!user) {
      throw createHttpError(404, "کاربر پیدا نشد");
    }
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw createHttpError(409, "کاربر قبلاً ثبت شده است");
      }
    }
    await user.update({
      name: name ? name.trim() : user.name,
      email: email ? email.toLowerCase().trim() : user.email,
      roleId: roleId || user.roleId,
    });
    res.status(200).json({
      message: "کاربر با موفقیت بروز رسانی شد",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        updated_at: user.updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Delete user
const deleteUserHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه کاربر نامعتبر است");
    }
    const user = await User.findByPk(id);
    if (!user) {
      throw createHttpError(404, "کاربر پیدا نشد");
    }
    await user.destroy();
    res.status(200).json({
      message: "کاربر با موفقیت حذف شد",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
};
