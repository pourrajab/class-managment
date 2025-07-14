const { Course, User } = require("./course.model");
const createHttpError = require("http-errors");

// Get all courses
const getCoursesHandler = async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.status(200).json({
      data: courses,
      count: courses.length,
    });
  } catch (err) {
    next(err);
  }
};

// Create new course
const addCourseHandler = async (req, res, next) => {
  try {
    const { title, description, teacherId } = req.body;
    if (!title || !teacherId) {
      throw createHttpError(400, "عنوان دوره و شناسه استاد الزامی هستند");
    }
    const teacher = await User.findByPk(teacherId, {
      include: [{ model: require("../RBAC/rbac.model").Role, as: "role", attributes: ["id", "title"] }],
    });
    if (!teacher) {
      throw createHttpError(404, "استاد پیدا نشد");
    }
    if (teacher.role?.title !== "teacher") {
      throw createHttpError(400, "نقش انتخاب شده باید استاد باشد");
    }
    const course = await Course.create({
      title: title.trim(),
      description: description?.trim(),
      teacherId,
    });
    res.status(201).json({
      message: "دوره با موفقیت ایجاد شد",
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// Get course by id
const getCourseByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه دوره نامعتبر است");
    }
    const course = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    if (!course) {
      throw createHttpError(404, "دوره پیدا نشد");
    }
    res.status(200).json({
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// Update course
const updateCourseHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, teacherId } = req.body;
    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه دوره نامعتبر است");
    }
    const course = await Course.findByPk(id);
    if (!course) {
      throw createHttpError(404, "دوره پیدا نشد");
    }
    if (teacherId && teacherId !== course.teacherId) {
      const teacher = await User.findByPk(teacherId);
      if (!teacher) {
        throw createHttpError(404, "استاد پیدا نشد");
      }
      if (teacher.role !== "teacher") {
        throw createHttpError(400, "نقش انتخاب شده باید استاد باشد");
      }
    }
    await course.update({
      title: title ? title.trim() : course.title,
      description:
        description !== undefined ? description.trim() : course.description,
      teacherId: teacherId || course.teacherId,
    });
    res.status(200).json({
      message: "دوره با موفقیت بروزرسانی شد",
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// Delete course
const deleteCourseHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه دوره نامعتبر است");
    }
    const course = await Course.findByPk(id);
    if (!course) {
      throw createHttpError(404, "دوره پیدا نشد");
    }
    await course.destroy();
    res.status(200).json({
      message: "دوره با موفقیت حذف شد",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCoursesHandler,
  addCourseHandler,
  getCourseByIdHandler,
  updateCourseHandler,
  deleteCourseHandler,
};
