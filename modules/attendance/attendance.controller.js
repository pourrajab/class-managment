const { Attendance } = require("./attendance.model");
const { Enrollment } = require("../enrollment/enrollment.model");
const { Session } = require("../session/session.model");
const { Course } = require("../course/course.model");
const { User } = require("../user/user.model");
const { Op } = require("sequelize");
const createHttpError = require("http-errors");

// Get all attendance records
const getAllAttendance = async (req, res, next) => {
  try {
    const {
      sessionId,
      enrollmentId,
      present,
      page = 1,
      limit = 10,
    } = req.query;

    const where = {};
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
          },
        ],
      },
      {
        model: Session,
        as: "session",
        attributes: ["id", "title", "date"],
      },
    ];

    if (sessionId) where.sessionId = sessionId;
    if (enrollmentId) where.enrollmentId = enrollmentId;
    if (present !== undefined) where.present = present;

    const offset = (page - 1) * limit;

    const attendance = await Attendance.findAndCountAll({
      where,
      include,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: attendance.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(attendance.count / limit),
        totalItems: attendance.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get attendance record by ID
const getAttendanceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه حضور و غیاب نامعتبر است");
    }

    const attendance = await Attendance.findByPk(id, {
      include: [
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
            },
          ],
        },
        {
          model: Session,
          as: "session",
          attributes: ["id", "title", "date"],
        },
      ],
    });

    if (!attendance) {
      throw createHttpError(404, "حضور و غیاب پیدا نشد");
    }

    res.json({
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// Create attendance record
const createAttendance = async (req, res, next) => {
  try {
    const {
      enrollmentId,
      sessionId,
      present,
      arrivalTime,
      departureTime,
      lateMinutes,
      earlyDepartureMinutes,
      notes,
    } = req.body;
    const recordedBy = req.user.id;

    // Validation
    if (!enrollmentId || !sessionId || present === undefined) {
      throw createHttpError(
        400,
        "شناسه ثبت‌نام، شناسه جلسه و وضعیت حضور الزامی است"
      );
    }

    // Check if enrollment exists
    const enrollment = await Enrollment.findByPk(enrollmentId);
    if (!enrollment) {
      throw createHttpError(404, "ثبت‌نام یافت نشد");
    }

    // Check if session exists
    const session = await Session.findByPk(sessionId);
    if (!session) {
      throw createHttpError(404, "جلسه یافت نشد");
    }

    // Check for duplicate attendance
    const existingAttendance = await Attendance.findOne({
      where: { enrollmentId, sessionId },
    });

    if (existingAttendance) {
      throw createHttpError(409, "حضور و غیاب قبلاً ثبت شده است");
    }

    // Create attendance record
    const attendance = await Attendance.create({
      enrollmentId,
      sessionId,
      present,
      arrivalTime,
      departureTime,
      lateMinutes: lateMinutes || 0,
      earlyDepartureMinutes: earlyDepartureMinutes || 0,
      notes: notes ? notes.trim() : null,
      recordedBy,
      recordingMethod: "manual",
    });

    // Get attendance record with details
    const attendanceWithDetails = await Attendance.findByPk(attendance.id, {
      include: [
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
            },
          ],
        },
        {
          model: Session,
          as: "session",
          attributes: ["id", "title", "date"],
        },
      ],
    });

    res.status(201).json({
      message: "حضور و غیاب با موفقیت ثبت شد",
      data: attendanceWithDetails,
    });
  } catch (err) {
    next(err);
  }
};

// Update attendance record
const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      present,
      arrivalTime,
      departureTime,
      lateMinutes,
      earlyDepartureMinutes,
      notes,
    } = req.body;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه حضور و غیاب نامعتبر است");
    }

    const attendance = await Attendance.findByPk(id);
    if (!attendance) {
      throw createHttpError(404, "حضور و غیاب پیدا نشد");
    }

    // Update attendance record
    await attendance.update({
      present: present !== undefined ? present : attendance.present,
      arrivalTime: arrivalTime || attendance.arrivalTime,
      departureTime: departureTime || attendance.departureTime,
      lateMinutes:
        lateMinutes !== undefined ? lateMinutes : attendance.lateMinutes,
      earlyDepartureMinutes:
        earlyDepartureMinutes !== undefined
          ? earlyDepartureMinutes
          : attendance.earlyDepartureMinutes,
      notes: notes !== undefined ? notes.trim() : attendance.notes,
    });

    // Get updated attendance record
    const updatedAttendance = await Attendance.findByPk(id, {
      include: [
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
            },
          ],
        },
        {
          model: Session,
          as: "session",
          attributes: ["id", "title", "date"],
        },
      ],
    });

    res.json({
      message: "حضور و غیاب با موفقیت بروزرسانی شد",
      data: updatedAttendance,
    });
  } catch (err) {
    next(err);
  }
};

// Delete attendance record
const deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه حضور و غیاب نامعتبر است");
    }

    const attendance = await Attendance.findByPk(id);
    if (!attendance) {
      throw createHttpError(404, "حضور و غیاب پیدا نشد");
    }

    await attendance.destroy();

    res.json({
      message: "حضور و غیاب با موفقیت حذف شد",
    });
  } catch (err) {
    next(err);
  }
};

// Get attendance records by session
const getAttendanceBySession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { present, page = 1, limit = 10 } = req.query;

    if (!sessionId || isNaN(sessionId)) {
      throw createHttpError(400, "شناسه جلسه نامعتبر است");
    }

    const where = { sessionId };
    if (present !== undefined) where.present = present;

    const offset = (page - 1) * limit;

    const attendance = await Attendance.findAndCountAll({
      where,
      include: [
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
            },
          ],
        },
      ],
      order: [["created_at", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: attendance.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(attendance.count / limit),
        totalItems: attendance.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get attendance records for a user
const getMyAttendance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId, present, page = 1, limit = 10 } = req.query;

    const where = {};
    const include = [
      {
        model: Enrollment,
        as: "enrollment",
        where: { userId },
        attributes: ["id", "status"],
        include: [
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
      },
    ];

    if (present !== undefined) where.present = present;

    const offset = (page - 1) * limit;

    const attendance = await Attendance.findAndCountAll({
      where,
      include,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: attendance.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(attendance.count / limit),
        totalItems: attendance.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get attendance report
const getAttendanceReport = async (req, res, next) => {
  try {
    const { courseId, userId, startDate, endDate, format = "json" } = req.query;

    const where = {};
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
        ...(userId && { where: { userId } }),
      },
      {
        model: Session,
        as: "session",
        attributes: ["id", "title", "date"],
      },
    ];

    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const attendance = await Attendance.findAll({
      where,
      include,
      order: [["created_at", "ASC"]],
    });

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter((a) => a.present).length,
      absent: attendance.filter((a) => !a.present).length,
      lateCount: attendance.filter((a) => a.lateMinutes > 0).length,
      earlyDepartureCount: attendance.filter((a) => a.earlyDepartureMinutes > 0)
        .length,
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
        "notes",
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
      data: {
        attendance,
        stats,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Create bulk attendance records
const createBulkAttendance = async (req, res, next) => {
  try {
    const { sessionId, attendanceData } = req.body;
    const recordedBy = req.user.id;

    if (!sessionId || !attendanceData || !Array.isArray(attendanceData)) {
      throw createHttpError(
        400,
        "شناسه جلسه و داده‌های حضور و غیاب الزامی هستند"
      );
    }

    // Check if session exists
    const session = await Session.findByPk(sessionId);
    if (!session) {
      throw createHttpError(404, "جلسه یافت نشد");
    }

    const results = [];
    const errors = [];

    for (const data of attendanceData) {
      try {
        const {
          enrollmentId,
          present,
          arrivalTime,
          departureTime,
          lateMinutes,
          earlyDepartureMinutes,
          notes,
        } = data;

        // Check if enrollment exists
        const enrollment = await Enrollment.findByPk(enrollmentId);
        if (!enrollment) {
          errors.push({ enrollmentId, error: "ثبت‌نام یافت نشد" });
          continue;
        }

        // Check for duplicate attendance
        const existingAttendance = await Attendance.findOne({
          where: { enrollmentId, sessionId },
        });

        if (existingAttendance) {
          errors.push({ enrollmentId, error: "حضور و غیاب قبلاً ثبت شده است" });
          continue;
        }

        // Create attendance record
        const attendance = await Attendance.create({
          enrollmentId,
          sessionId,
          present,
          arrivalTime,
          departureTime,
          lateMinutes: lateMinutes || 0,
          earlyDepartureMinutes: earlyDepartureMinutes || 0,
          notes: notes ? notes.trim() : null,
          recordedBy,
          recordingMethod: "manual",
        });

        results.push(attendance);
      } catch (error) {
        errors.push({ enrollmentId: data.enrollmentId, error: error.message });
      }
    }

    res.status(201).json({
      message: "حضور و غیاب گروهی با موفقیت ثبت شد",
      data: {
        created: results.length,
        errors: errors.length,
        results,
        errors,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceBySession,
  getMyAttendance,
  getAttendanceReport,
  createBulkAttendance,
};
