const { User } = require("../user/user.model");
const { Course } = require("../course/course.model");
const { Session } = require("../session/session.model");
const { Enrollment } = require("../enrollment/enrollment.model");
const { Attendance } = require("../attendance/attendance.model");
const { Payment } = require("../payment/payment.model");
const { Op } = require("sequelize");
const createHttpError = require("http-errors");

// All comments in this file should be in English. All user-facing messages (message fields and error messages) should be in Persian.
// System overview report
const getSystemOverview = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // User statistics
    const userStats = await User.findAll({
      where,
      attributes: [
        "roleId",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      include: [{ model: require("../RBAC/rbac.model").Role, as: "role", attributes: ["id", "title"] }],
      group: ["roleId", "role.id", "role.title"],
    });

    // Course statistics
    const courseStats = await Course.findAll({
      where,
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    // Session statistics
    const sessionStats = await Session.findAll({
      where,
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    // Enrollment statistics
    const enrollmentStats = await Enrollment.findAll({
      where,
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    // Payment statistics
    const paymentStats = await Payment.findAll({
      where,
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalAmount"],
      ],
      group: ["status"],
    });

    // Attendance statistics
    const attendanceStats = await Attendance.findAll({
      where,
      attributes: [
        "present",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["present"],
    });

    res.json({
      message: "عملیات با موفقیت انجام شد",
      data: {
        userStats,
        courseStats,
        sessionStats,
        enrollmentStats,
        paymentStats,
        attendanceStats,
        period: { startDate, endDate },
      },
    });
  } catch (err) {
    next(err);
  }
};

// Course report
const getCourseReport = async (req, res, next) => {
  try {
    const { courseId, format = "json" } = req.query;

    if (!courseId) {
      throw createHttpError(400, "شناسه دوره الزامی است");
    }

    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!course) {
      throw createHttpError(404, "دوره یافت نشد");
    }

    // Enrollment statistics
    const enrollmentStats = await Enrollment.findAll({
      where: { courseId },
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    // Session statistics
    const sessionStats = await Session.findAll({
      where: { courseId },
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    // Attendance statistics
    const attendanceStats = await Attendance.findAll({
      include: [
        {
          model: Enrollment,
          as: "enrollment",
          where: { courseId },
          attributes: [],
        },
      ],
      attributes: [
        "present",
        [sequelize.fn("COUNT", sequelize.col("Attendance.id")), "count"],
      ],
      group: ["present"],
    });

    // Payment statistics
    const paymentStats = await Payment.findAll({
      where: { courseId },
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalAmount"],
      ],
      group: ["status"],
    });

    // Student list
    const students = await Enrollment.findAll({
      where: { courseId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    const report = {
      course,
      enrollmentStats,
      sessionStats,
      attendanceStats,
      paymentStats,
      students,
    };

    if (format === "csv") {
      const csv = require("json2csv");
      const fields = [
        "id",
        "name",
        "email",
        "status",
        "enrollmentDate",
        "grade",
      ];
      const csvData = csv.parse(students, { fields });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=course-${courseId}-report.csv`
      );
      return res.send(csvData);
    }

    res.json({
      message: "عملیات با موفقیت انجام شد",
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

// Student report
const getStudentReport = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { format = "json" } = req.query;

    if (!userId || isNaN(userId)) {
      throw createHttpError(400, "شناسه کاربر الزامی است");
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw createHttpError(404, "کاربر یافت نشد");
    }

    // Student enrollments
    const enrollments = await Enrollment.findAll({
      where: { userId },
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
    });

    // Attendance statistics
    const attendanceStats = await Attendance.findAll({
      include: [
        {
          model: Enrollment,
          as: "enrollment",
          where: { userId },
          attributes: [],
        },
      ],
      attributes: [
        "present",
        [sequelize.fn("COUNT", sequelize.col("Attendance.id")), "count"],
      ],
      group: ["present"],
    });

    // Student payments
    const payments = await Payment.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Payment statistics
    const paymentStats = await Payment.findAll({
      where: { userId },
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalAmount"],
      ],
      group: ["status"],
    });

    const report = {
      user,
      enrollments,
      attendanceStats,
      payments,
      paymentStats,
    };

    if (format === "csv") {
      const csv = require("json2csv");
      const fields = [
        "id",
        "title",
        "status",
        "enrollmentDate",
        "grade",
        "certificateIssued",
      ];
      const csvData = csv.parse(enrollments, { fields });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=student-${userId}-report.csv`
      );
      return res.send(csvData);
    }

    res.json({
      message: "عملیات با موفقیت انجام شد",
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

// Financial report
const getFinancialReport = async (req, res, next) => {
  try {
    const { startDate, endDate, courseId, format = "json" } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }
    if (courseId) where.courseId = courseId;

    // Payment statistics
    const paymentStats = await Payment.findAll({
      where,
      attributes: [
        "status",
        "paymentMethod",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalAmount"],
        [sequelize.fn("SUM", sequelize.col("discountAmount")), "totalDiscount"],
        [sequelize.fn("SUM", sequelize.col("taxAmount")), "totalTax"],
      ],
      group: ["status", "paymentMethod"],
    });

    // Course statistics
    const courseStats = await Payment.findAll({
      where,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
      attributes: [
        "courseId",
        [sequelize.fn("COUNT", sequelize.col("Payment.id")), "count"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalAmount"],
      ],
      group: ["courseId"],
    });

    // Monthly statistics
    const monthlyStats = await Payment.findAll({
      where,
      attributes: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("created_at"), "%Y-%m"),
          "month",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalAmount"],
      ],
      group: ["month"],
      order: [["month", "ASC"]],
    });

    // Total revenue
    const totalRevenue = await Payment.sum("totalAmount", {
      where: { ...where, status: "paid" },
    });

    // Total discount
    const totalDiscount = await Payment.sum("discountAmount", {
      where: { ...where, status: "paid" },
    });

    // Total tax
    const totalTax = await Payment.sum("taxAmount", {
      where: { ...where, status: "paid" },
    });

    const report = {
      paymentStats,
      courseStats,
      monthlyStats,
      summary: {
        totalRevenue: totalRevenue || 0,
        totalDiscount: totalDiscount || 0,
        totalTax: totalTax || 0,
        netRevenue: (totalRevenue || 0) - (totalDiscount || 0),
      },
      period: { startDate, endDate },
    };

    if (format === "csv") {
      const csv = require("json2csv");
      const fields = [
        "id",
        "amount",
        "totalAmount",
        "status",
        "paymentMethod",
        "created_at",
      ];
      const payments = await Payment.findAll({
        where,
        include: [{ model: Course, as: "course", attributes: ["title"] }],
      });
      const csvData = csv.parse(payments, { fields });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=financial-report.csv"
      );
      return res.send(csvData);
    }

    res.json({
      message: "عملیات با موفقیت انجام شد",
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

// Attendance report
const getAttendanceReport = async (req, res, next) => {
  try {
    const {
      courseId,
      sessionId,
      startDate,
      endDate,
      format = "json",
    } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const include = [
      {
        model: Enrollment,
        as: "enrollment",
        attributes: ["id", "status"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
          {
            model: Course,
            as: "course",
            attributes: ["id", "title"],
            ...(courseId && { where: { id: courseId } }),
          },
        ],
      },
      {
        model: Session,
        as: "session",
        attributes: ["id", "title", "date"],
        ...(sessionId && { where: { id: sessionId } }),
      },
    ];

    const attendance = await Attendance.findAll({
      where,
      include,
      order: [["created_at", "ASC"]],
    });

    // Overall statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter((a) => a.present).length,
      absent: attendance.filter((a) => !a.present).length,
      lateCount: attendance.filter((a) => a.lateMinutes > 0).length,
      earlyDepartureCount: attendance.filter((a) => a.earlyDepartureMinutes > 0)
        .length,
    };

    // Statistics by course
    const courseStats = await Attendance.findAll({
      where,
      include: [
        {
          model: Enrollment,
          as: "enrollment",
          attributes: [],
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "title"],
            },
          ],
        },
      ],
      attributes: [
        "present",
        [sequelize.fn("COUNT", sequelize.col("Attendance.id")), "count"],
      ],
      group: ["present", "course.id", "course.title"],
    });

    const report = {
      attendance,
      stats,
      courseStats,
      period: { startDate, endDate },
    };

    if (format === "csv") {
      const csv = require("json2csv");
      const fields = [
        "id",
        "present",
        "arrivalTime",
        "departureTime",
        "lateMinutes",
        "earlyDepartureMinutes",
        "created_at",
      ];
      const csvData = csv.parse(attendance, { fields });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=attendance-report.csv"
      );
      return res.send(csvData);
    }

    res.json({
      message: "عملیات با موفقیت انجام شد",
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

// Teacher performance report
const getTeacherPerformanceReport = async (req, res, next) => {
  try {
    const { teacherId, startDate, endDate, format = "json" } = req.query;

    if (!teacherId) {
      throw createHttpError(400, "شناسه استاد الزامی است");
    }

    const teacher = await User.findByPk(teacherId, { include: [{ model: require("../RBAC/rbac.model").Role, as: "role", attributes: ["id", "title"] }] });
    if (!teacher || teacher.role?.title !== "teacher") {
      throw createHttpError(404, "استاد یافت نشد");
    }

    // Teacher's courses
    const courses = await Course.findAll({
      where: { teacherId },
      include: [
        {
          model: Session,
          as: "sessions",
          attributes: ["id", "title", "date", "status"],
        },
        {
          model: Enrollment,
          as: "enrollments",
          attributes: ["id", "status", "grade"],
        },
      ],
    });

    // Course statistics
    const courseStats = courses.map((course) => ({
      courseId: course.id,
      courseTitle: course.title,
      sessionCount: course.sessions.length,
      enrollmentCount: course.enrollments.length,
      completedSessions: course.sessions.filter((s) => s.status === "completed")
        .length,
      averageGrade:
        course.enrollments
          .filter((e) => e.grade !== null)
          .reduce((sum, e) => sum + parseFloat(e.grade), 0) /
          course.enrollments.filter((e) => e.grade !== null).length || 0,
    }));

    // Overall statistics
    const totalCourses = courses.length;
    const totalSessions = courses.reduce(
      (sum, c) => sum + c.sessions.length,
      0
    );
    const totalEnrollments = courses.reduce(
      (sum, c) => sum + c.enrollments.length,
      0
    );
    const completedSessions = courses.reduce(
      (sum, c) =>
        sum + c.sessions.filter((s) => s.status === "completed").length,
      0
    );

    const report = {
      teacher,
      courses,
      courseStats,
      summary: {
        totalCourses,
        totalSessions,
        totalEnrollments,
        completedSessions,
        completionRate:
          totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      },
      period: { startDate, endDate },
    };

    if (format === "csv") {
      const csv = require("json2csv");
      const fields = [
        "courseId",
        "courseTitle",
        "sessionCount",
        "enrollmentCount",
        "completedSessions",
        "averageGrade",
      ];
      const csvData = csv.parse(courseStats, { fields });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=teacher-${teacherId}-performance.csv`
      );
      return res.send(csvData);
    }

    res.json({
      message: "عملیات با موفقیت انجام شد",
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSystemOverview,
  getCourseReport,
  getStudentReport,
  getFinancialReport,
  getAttendanceReport,
  getTeacherPerformanceReport,
};
