// All comments in this file should be in English. All user-facing messages (message fields and error messages) should be in Persian.
const createHttpError = require("http-errors");
const { Role, Permission, RolePermission } = require("./rbac.model");
const { Op } = require("sequelize");

// create new role
async function createRoleHandler(req, res, next) {
  try {
    const { title, description } = req.body;
    const existRole = await Role.findOne({ where: { title } });
    if (existRole) throw createHttpError(409, "عنوان نقش قبلاً ثبت شده است");
    await Role.create({ title, description });
    return res.json({ message: "نقش با موفقیت ایجاد شد" });
  } catch (error) {
    next(error);
  }
}

// create new permission 
async function createPermissionHandler(req, res, next) {
  try {
    const { title, description } = req.body;
    const existPermission = await Permission.findOne({ where: { title } });
    if (existPermission)
      throw createHttpError(409, "عنوان دسترسی قبلاً ثبت شده است");
    await Permission.create({ title, description });
    return res.json({ message: "دسترسی با موفقیت ایجاد شد" });
  } catch (error) {
    next(error);
  }
}

// انتساب permission به نقش
async function assignPermissionToRoleHandler(req, res, next) {
  try {
    let { roleId, permissions = [] } = req.body;
    const role = await Role.findOne({ where: { id: roleId } });
    if (!role) return next(createHttpError(404, "نقش مورد نظر یافت نشد"));
    if (permissions?.length > 0) {
      const permisionCount = await Permission.count({
        where: { id: { [Op.in]: permissions } },
      });
      if (permisionCount !== permissions.length) {
        return next(createHttpError(400, "لیست دسترسی‌ها صحیح نیست"));
      }
      // حذف permissionهای قبلی این نقش (برای حالت بازنویسی)
      await RolePermission.destroy({ where: { roleId } });
      const permissionList = permissions.map((per) => ({
        roleId,
        permissionId: per,
      }));
      await RolePermission.bulkCreate(permissionList);
    }
    return res.json({ message: "دسترسی‌ها با موفقیت به نقش اختصاص یافتند" });
  } catch (error) {
    next(error);
  }
}

// گرفتن لیست نقش‌ها
async function getRolesHandler(req, res, next) {
  try {
    const roles = await Role.findAll();
    res.json({ roles });
  } catch (error) {
    next(error);
  }
}

// گرفتن لیست permissionها
async function getPermissionsHandler(req, res, next) {
  try {
    const permissions = await Permission.findAll();
    res.json({ permissions });
  } catch (error) {
    next(error);
  }
}

// گرفتن permissionهای یک نقش
async function getRolePermissionsHandler(req, res, next) {
  try {
    const { roleId } = req.params;
    const role = await Role.findByPk(roleId);
    if (!role) return next(createHttpError(404, "نقش یافت نشد"));
    const rolePermissions = await RolePermission.findAll({ where: { roleId } });
    const permissionIds = rolePermissions.map((rp) => rp.permissionId);
    const permissions = await Permission.findAll({
      where: { id: { [Op.in]: permissionIds } },
    });
    res.json({ role, permissions });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createRoleHandler,
  createPermissionHandler,
  assignPermissionToRoleHandler,
  getRolesHandler,
  getPermissionsHandler,
  getRolePermissionsHandler,
};
