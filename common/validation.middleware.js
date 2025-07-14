const { validate, Joi } = require("express-validation");

// User creation validation
const createUserValidation = validate({
  body: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      "string.min": "نام باید حداقل 2 کاراکتر باشد",
      "string.max": "نام باید حداکثر 50 کاراکتر باشد",
      "any.required": "نام الزامی است",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "ایمیل معتبر نیست",
      "any.required": "ایمیل الزامی است",
    }),
    roleId: Joi.number().integer().required().messages({
      "number.base": "شناسه نقش باید عدد باشد",
      "any.required": "شناسه نقش الزامی است",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "پسورد باید حداقل 6 کاراکتر باشد",
      "any.required": "پسورد الزامی است",
    }),
  }),
});

// Login validation
const loginValidation = validate({
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "ایمیل معتبر نیست",
      "any.required": "ایمیل الزامی است",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "پسورد باید حداقل 6 کاراکتر باشد",
      "any.required": "پسورد الزامی است",
    }),
  }),
});

// Signup validation (same as user creation)
const signupValidation = createUserValidation;

// ID validation
const idValidation = validate({
  params: Joi.object({
    id: Joi.number().integer().min(1).required().messages({
      "number.base": "شناسه باید عدد باشد",
      "number.integer": "شناسه باید عدد صحیح باشد",
      "number.min": "شناسه باید عدد مثبت باشد",
      "any.required": "شناسه الزامی است",
    }),
  }),
});

// Course ID validation
const courseIdValidation = validate({
  params: Joi.object({
    courseId: Joi.number().integer().min(1).required().messages({
      "number.base": "شناسه دوره باید عدد باشد",
      "number.integer": "شناسه دوره باید عدد صحیح باشد",
      "number.min": "شناسه دوره باید عدد مثبت باشد",
      "any.required": "شناسه دوره الزامی است",
    }),
  }),
});

// Session ID validation
const sessionIdValidation = validate({
  params: Joi.object({
    sessionId: Joi.number().integer().min(1).required().messages({
      "number.base": "شناسه جلسه باید عدد باشد",
      "number.integer": "شناسه جلسه باید عدد صحیح باشد",
      "number.min": "شناسه جلسه باید عدد مثبت باشد",
      "any.required": "شناسه جلسه الزامی است",
    }),
  }),
});

// User ID validation
const userIdValidation = validate({
  params: Joi.object({
    userId: Joi.number().integer().min(1).required().messages({
      "number.base": "شناسه کاربر باید عدد باشد",
      "number.integer": "شناسه کاربر باید عدد صحیح باشد",
      "number.min": "شناسه کاربر باید عدد مثبت باشد",
      "any.required": "شناسه کاربر الزامی است",
    }),
  }),
});

// User update validation
const updateUserValidation = validate({
  body: Joi.object({
    name: Joi.string().min(2).max(50).optional().messages({
      "string.min": "نام باید حداقل 2 کاراکتر باشد",
      "string.max": "نام باید حداکثر 50 کاراکتر باشد",
    }),
    email: Joi.string().email().optional().messages({
      "string.email": "ایمیل معتبر نیست",
    }),
    roleId: Joi.number().integer().optional().messages({
      "number.base": "شناسه نقش باید عدد باشد",
    }),
  }),
});

// Change password validation
const changePasswordValidation = validate({
  body: Joi.object({
    currentPassword: Joi.string().min(6).required().messages({
      "string.min": "پسورد فعلی باید حداقل 6 کاراکتر باشد",
      "any.required": "پسورد فعلی الزامی است",
    }),
    newPassword: Joi.string().min(6).required().messages({
      "string.min": "پسورد جدید باید حداقل 6 کاراکتر باشد",
      "any.required": "پسورد جدید الزامی است",
    }),
  }),
});

module.exports = {
  createUserValidation,
  loginValidation,
  signupValidation,
  idValidation,
  courseIdValidation,
  sessionIdValidation,
  userIdValidation,
  updateUserValidation,
  changePasswordValidation,
};
