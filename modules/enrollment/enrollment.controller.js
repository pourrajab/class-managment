const { Enrollment } = require("./enrollment.model");
const { Course } = require("../course/course.model");
const { User } = require("../user/user.model");
const { Session } = require("../session/session.model");
const { Attendance } = require("../attendance/attendance.model");
const { Payment } = require("../payment/payment.model");
const { Op } = require("sequelize");
const createHttpError = require("http-errors");

// Get all enrollments (only for administrators)
const getAllEnrollments = async (req, res, next) => {
  try {
    const { courseId, userId, status, page = 1, limit = 10 } = req.query;

    const where = {};
    const include = [
      {
        model: Course,
        as: "course",
        attributes: ["id", "title", "description"],
        include: [
          {
            model: User,
            as: "teacher",
            attributes: ["id", "name", "email"],
          },
        ],
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "roleId"],
        include: [
          {
            model: require("../RBAC/rbac.model").Role,
            as: "role",
            attributes: ["id", "title"],
          },
        ],
      },
    ];

    if (courseId) where.courseId = courseId;
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const enrollments = await Enrollment.findAndCountAll({
      where,
      include,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: enrollments.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(enrollments.count / limit),
        totalItems: enrollments.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get enrollment by ID
const getEnrollmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه ثبت نام نامعتبر است");
    }

    const enrollment = await Enrollment.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description"],
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "roleId"],
          include: [
            {
              model: require("../RBAC/rbac.model").Role,
              as: "role",
              attributes: ["id", "title"],
            },
          ],
        },
      ],
    });

    if (!enrollment) {
      throw createHttpError(404, "ثبت نام پیدا نشد");
    }

    // Get attendance statistics
    const attendanceStats = await Attendance.findAll({
      where: { enrollmentId: id },
      attributes: [
        "present",
        [sequelize.fn("COUNT", sequelize.col("present")), "count"],
      ],
      group: ["present"],
    });

    const presentCount =
      attendanceStats.find((stat) => stat.present)?.dataValues?.count || 0;
    const absentCount =
      attendanceStats.find((stat) => !stat.present)?.dataValues?.count || 0;

    // Get payment information
    const payments = await Payment.findAll({
      where: {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
      },
      attributes: ["id", "amount", "status", "created_at"],
    });

    res.json({
      data: {
        ...enrollment.toJSON(),
        attendanceStats: {
          present: presentCount,
          absent: absentCount,
          total: presentCount + absentCount,
        },
        payments,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Enroll in course
const createEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      throw createHttpError(400, "شناسه دوره الزامی است");
    }

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw createHttpError(404, "دوره پیدا نشد");
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw createHttpError(404, "کاربر پیدا نشد");
    }

    // Check for duplicate enrollment
    const existingEnrollment = await Enrollment.findOne({
      where: { userId, courseId },
    });

    if (existingEnrollment) {
      throw createHttpError(409, "این ثبت نام قبلاً ثبت شده است");
    }

    // Check course capacity
    const enrollmentCount = await Enrollment.count({
      where: {
        courseId,
        status: { [Op.in]: ["pending", "accepted"] },
      },
    });

    if (course.maxStudents && enrollmentCount >= course.maxStudents) {
      throw createHttpError(409, "ظرفیت دوره پر شده است");
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      status: "pending",
      enrollmentDate: new Date(),
    });

    // Get enrollment with details
    const enrollmentWithDetails = await Enrollment.findByPk(enrollment.id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description"],
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "roleId"],
          include: [
            {
              model: require("../RBAC/rbac.model").Role,
              as: "role",
              attributes: ["id", "title"],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      message: "ثبت نام با موفقیت ایجاد شد",
      data: enrollmentWithDetails,
    });
  } catch (err) {
    next(err);
  }
};

// Update enrollment
const updateEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, grade, notes, completionDate, certificateIssued } =
      req.body;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه ثبت نام نامعتبر است");
    }

    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      throw createHttpError(404, "ثبت نام پیدا نشد");
    }

    // Update enrollment
    await enrollment.update({
      status: status || enrollment.status,
      grade: grade !== undefined ? grade : enrollment.grade,
      notes: notes !== undefined ? notes.trim() : enrollment.notes,
      completionDate: completionDate
        ? new Date(completionDate)
        : enrollment.completionDate,
      certificateIssued:
        certificateIssued !== undefined
          ? certificateIssued
          : enrollment.certificateIssued,
      certificateIssueDate: certificateIssued
        ? new Date()
        : enrollment.certificateIssueDate,
    });

    // Get updated enrollment
    const updatedEnrollment = await Enrollment.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description"],
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "roleId"],
          include: [
            {
              model: require("../RBAC/rbac.model").Role,
              as: "role",
              attributes: ["id", "title"],
            },
          ],
        },
      ],
    });

    res.json({
      message: "ثبت نام با موفقیت به‌روزرسانی شد",
      data: updatedEnrollment,
    });
  } catch (err) {
    next(err);
  }
};

// Delete enrollment
const deleteEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه ثبت نام نامعتبر است");
    }

    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      throw createHttpError(404, "ثبت نام پیدا نشد");
    }

    // Check for attendance and absence
    const attendanceCount = await Attendance.count({
      where: { enrollmentId: id },
    });

    if (attendanceCount > 0) {
      throw createHttpError(
        409,
        "ثبت نام‌هایی که حضور یا غیاب دارند قابل حذف نیستند"
      );
    }

    await enrollment.destroy();

    res.json({
      message: "ثبت نام با موفقیت حذف شد",
    });
  } catch (err) {
    next(err);
  }
};

// Get user's enrollments
const getMyEnrollments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const enrollments = await Enrollment.findAndCountAll({
      where,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description"],
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: enrollments.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(enrollments.count / limit),
        totalItems: enrollments.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get course enrollments
const getEnrollmentsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    if (!courseId || isNaN(courseId)) {
      throw createHttpError(400, "شناسه دوره نامعتبر است");
    }

    const where = { courseId };
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const enrollments = await Enrollment.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "roleId"],
          include: [
            {
              model: require("../RBAC/rbac.model").Role,
              as: "role",
              attributes: ["id", "title"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: enrollments.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(enrollments.count / limit),
        totalItems: enrollments.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Update enrollment status
const updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه ثبت نام نامعتبر است");
    }

    if (!status) {
      throw createHttpError(400, "وضعیت الزامی است");
    }

    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      throw createHttpError(404, "ثبت نام پیدا نشد");
    }

    await enrollment.update({ status });

    res.json({
      message: "وضعیت ثبت نام با موفقیت به‌روزرسانی شد",
      data: enrollment,
    });
  } catch (err) {
    next(err);
  }
};

// Get enrollment statistics
const getEnrollmentStats = async (req, res, next) => {
  try {
    const { courseId } = req.query;

    const where = {};
    if (courseId) {
      where.courseId = courseId;
    }

    const stats = await Enrollment.findAll({
      where,
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    const totalEnrollments = await Enrollment.count({ where });
    const activeEnrollments = await Enrollment.count({
      where: {
        ...where,
        status: { [Op.in]: ["pending", "accepted"] },
      },
    });

    res.json({
      data: {
        stats,
        totalEnrollments,
        activeEnrollments,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getMyEnrollments,
  getEnrollmentsByCourse,
  updateEnrollmentStatus,
  getEnrollmentStats,
};
