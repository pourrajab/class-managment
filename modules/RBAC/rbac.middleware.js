const createHttpError = require("http-errors");
const { RolePermission, Permission } = require("./rbac.model");

// This middleware checks if the user's role has the required permission
// Input: permission name (e.g., 'course:create')
function permitHandler(permissionTitle) {
  return async (req, res, next) => {
    try {
      // Assumption: req.user.roleId is present in the token or user object
      const roleId = req.user.roleId;
      if (!roleId) {
        return next(createHttpError(403, "نقش کاربر مشخص نیست"));
      }
      // Find the permissions of the role
      const rolePermissions = await RolePermission.findAll({
        where: { roleId },
      });
      const permissionIds = rolePermissions.map((rp) => rp.permissionId);
      if (!permissionIds.length) {
        return next(createHttpError(403, "دسترسی غیرمجاز"));
      }
      const permissions = await Permission.findAll({
        where: { id: permissionIds },
      });
      const permissionTitles = permissions.map((p) => p.title);
      if (permissionTitles.includes(permissionTitle)) {
        return next();
      }
      return next(createHttpError(403, "دسترسی غیرمجاز"));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = permitHandler;
