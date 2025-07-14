const { Session } = require("./session.model");
const { Course } = require("../course/course.model");
const { User } = require("../user/user.model");
const { Attendance } = require("../attendance/attendance.model");
const { Enrollment } = require("../enrollment/enrollment.model");
const { Op } = require("sequelize");
const createHttpError = require("http-errors");

// Get all sessions
const getAllSessions = async (req, res, next) => {
  try {
    const { courseId, status, date, page = 1, limit = 10 } = req.query;

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
    ];

    // Filter by course
    if (courseId) {
      where.courseId = courseId;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by date
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      where.date = {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      };
    }

    const offset = (page - 1) * limit;

    const sessions = await Session.findAndCountAll({
      where,
      include,
      order: [["date", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: sessions.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(sessions.count / limit),
        totalItems: sessions.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get session by ID
const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "کد جلسه نامعتبر است");
    }

    const session = await Session.findByPk(id, {
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
    });

    if (!session) {
      throw createHttpError(404, "جلسه پیدا نشد");
    }

    // Get attendance stats
    const attendanceStats = await Attendance.findAll({
      where: { sessionId: id },
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

    res.json({
      data: {
        ...session.toJSON(),
        attendanceStats: {
          present: presentCount,
          absent: absentCount,
          total: presentCount + absentCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// Create new session
const createSession = async (req, res, next) => {
  try {
    const {
      courseId,
      title,
      description,
      date,
      duration,
      location,
      maxStudents,
    } = req.body;

    // Validation
    if (!courseId || !title || !date) {
      throw createHttpError(
        400,
        "شناسه دوره، عنوان جلسه و تاریخ جلسه الزامی است"
      );
    }

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw createHttpError(404, "دوره پیدا نشد");
    }

    // Check for future date
    const sessionDate = new Date(date);
    if (sessionDate <= new Date()) {
      throw createHttpError(400, "تاریخ جلسه باید از امروز باشد");
    }

    // Check for time conflict
    const conflictingSession = await Session.findOne({
      where: {
        courseId,
        date: {
          [Op.between]: [
            new Date(sessionDate.getTime() - duration * 60000),
            new Date(sessionDate.getTime() + duration * 60000),
          ],
        },
        status: {
          [Op.in]: ["scheduled", "in_progress"],
        },
      },
    });

    if (conflictingSession) {
      throw createHttpError(409, "یک جلسه در زمان مشخص شده قبلاً وجود دارد");
    }

    // Create new session
    const session = await Session.create({
      courseId,
      title: title.trim(),
      description: description ? description.trim() : null,
      date: sessionDate,
      duration: duration || 90,
      location: location ? location.trim() : null,
      maxStudents: maxStudents || null,
    });

    // Get session with course details
    const sessionWithCourse = await Session.findByPk(session.id, {
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
    });

    res.status(201).json({
      message: "جلسه با موفقیت ایجاد شد",
      data: sessionWithCourse,
    });
  } catch (err) {
    next(err);
  }
};

// Update session
const updateSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      duration,
      location,
      maxStudents,
      status,
    } = req.body;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "کد جلسه نامعتبر است");
    }

    const session = await Session.findByPk(id);
    if (!session) {
      throw createHttpError(404, "جلسه پیدا نشد");
    }

    // Check for future date (if changed)
    if (date) {
      const sessionDate = new Date(date);
      if (sessionDate <= new Date()) {
        throw createHttpError(400, "تاریخ جلسه باید از امروز باشد");
      }
    }

    // Update session
    await session.update({
      title: title ? title.trim() : session.title,
      description:
        description !== undefined ? description.trim() : session.description,
      date: date ? new Date(date) : session.date,
      duration: duration || session.duration,
      location: location !== undefined ? location.trim() : session.location,
      maxStudents:
        maxStudents !== undefined ? maxStudents : session.maxStudents,
      status: status || session.status,
    });

    // Get updated session
    const updatedSession = await Session.findByPk(id, {
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
    });

    res.json({
      message: "جلسه با موفقیت به‌روزرسانی شد",
      data: updatedSession,
    });
  } catch (err) {
    next(err);
  }
};

// Delete session
const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "کد جلسه نامعتبر است");
    }

    const session = await Session.findByPk(id);
    if (!session) {
      throw createHttpError(404, "جلسه پیدا نشد");
    }

    // Check for attendance and absence
    const attendanceCount = await Attendance.count({
      where: { sessionId: id },
    });

    if (attendanceCount > 0) {
      throw createHttpError(409, "جلسه ای که حضور یا غیاب دارد قابل حذف نیست");
    }

    await session.destroy();

    res.json({
      message: "جلسه با موفقیت حذف شد",
    });
  } catch (err) {
    next(err);
  }
};

// Get course sessions
const getSessionsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    if (!courseId || isNaN(courseId)) {
      throw createHttpError(400, "شناسه دوره نامعتبر است");
    }

    const where = { courseId };
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const sessions = await Session.findAndCountAll({
      where,
      order: [["date", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: sessions.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(sessions.count / limit),
        totalItems: sessions.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Update session status
const updateSessionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "کد جلسه نامعتبر است");
    }

    if (!status) {
      throw createHttpError(400, "وضعیت الزامی است");
    }

    const session = await Session.findByPk(id);
    if (!session) {
      throw createHttpError(404, "جلسه پیدا نشد");
    }

    // Check status logic
    if (session.status === "completed" && status !== "completed") {
      throw createHttpError(409, "وضعیت  جلسه تکمیل شده قابل تغییر نیست");
    }

    if (session.status === "cancelled" && status !== "cancelled") {
      throw createHttpError(409, "وضعیت  جلسه لغو شده قابل تغییر نیست");
    }

    await session.update({ status });

    res.json({
      message: "وضعیت جلسه با موفقیت به‌روزرسانی شد",
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

// Get session stats
const getSessionStats = async (req, res, next) => {
  try {
    const { courseId } = req.query;

    const where = {};
    if (courseId) {
      where.courseId = courseId;
    }

    const stats = await Session.findAll({
      where,
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    const totalSessions = await Session.count({ where });
    const upcomingSessions = await Session.count({
      where: {
        ...where,
        date: { [Op.gt]: new Date() },
        status: "scheduled",
      },
    });

    res.json({
      data: {
        stats,
        totalSessions,
        upcomingSessions,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getSessionsByCourse,
  updateSessionStatus,
  getSessionStats,
};
