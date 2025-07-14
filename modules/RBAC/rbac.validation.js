const { validate, Joi } = require("express-validation");

// Validation for creating a role
const createRoleValidation = validate({
  body: Joi.object({
    title: Joi.string().min(2).max(50).required().messages({
      "string.base": "عنوان نقش باید رشته باشد",
      "string.empty": "عنوان نقش الزامی است",
      "string.min": "عنوان نقش باید حداقل 2 کاراکتر باشد",
      "string.max": "عنوان نقش باید حداکثر 50 کاراکتر باشد",
      "any.required": "عنوان نقش الزامی است",
    }),
    description: Joi.string().max(255).allow(null, "").messages({
      "string.max": "توضیحات نقش حداکثر 255 کاراکتر باشد",
    }),
  }),
});

// Validation for creating a permission
const createPermissionValidation = validate({
  body: Joi.object({
    title: Joi.string().min(2).max(50).required().messages({
      "string.base": "عنوان دسترسی باید رشته باشد",
      "string.empty": "عنوان دسترسی الزامی است",
      "string.min": "عنوان دسترسی باید حداقل 2 کاراکتر باشد",
      "string.max": "عنوان دسترسی باید حداکثر 50 کاراکتر باشد",
      "any.required": "عنوان دسترسی الزامی است",
    }),
    description: Joi.string().max(255).allow(null, "").messages({
      "string.max": "توضیحات دسترسی حداکثر 255 کاراکتر باشد",
    }),
  }),
});

// Validation for assigning permission to a role
const assignPermissionToRoleValidation = validate({
  body: Joi.object({
    roleId: Joi.number().integer().required().messages({
      "number.base": "شناسه نقش باید عدد باشد",
      "any.required": "شناسه نقش الزامی است",
    }),
    permissions: Joi.array().items(Joi.number().integer()).optional().messages({
      "array.base": "لیست دسترسی‌ها باید آرایه‌ای از اعداد باشد",
    }),
  }),
});

module.exports = {
  createRoleValidation,
  createPermissionValidation,
  assignPermissionToRoleValidation,
};
