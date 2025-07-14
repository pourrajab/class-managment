const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize.config");
const RefreshToken = require("../modules/user/refreshToken.model");

// RBAC models
const {
  Role,
  Permission,
  RolePermission,
} = require("../modules/RBAC/rbac.model");

// User Model
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "نام نمی‌تواند خالی باشد" },
        len: { args: [2, 50], msg: "نام باید بین 2 تا 50 کاراکتر باشد" },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "ایمیل معتبر نیست" },
        notEmpty: { msg: "ایمیل نمی‌تواند خالی باشد" },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "پسورد نمی‌تواند خالی باشد" },
        len: { args: [6, 100], msg: "پسورد باید حداقل 6 کاراکتر باشد" },
      },
    },
    role: {
      type: DataTypes.ENUM("student", "teacher", "admin"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["student", "teacher", "admin"]],
          msg: "نقش باید یکی از student، teacher یا admin باشد",
        },
      },
    },
  },
  {
    modelName: "User",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Course Model
const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "عنوان دوره نمی‌تواند خالی باشد" },
        len: {
          args: [3, 100],
          msg: "عنوان دوره باید بین 3 تا 100 کاراکتر باشد",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: "توضیحات نمی‌تواند بیشتر از 1000 کاراکتر باشد",
        },
      },
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه استاد باید عدد باشد" },
        min: { args: [1], msg: "شناسه استاد باید مثبت باشد" },
      },
    },
  },
  {
    modelName: "Course",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Session Model
const Session = sequelize.define(
  "Session",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه دوره باید عدد باشد" },
        min: { args: [1], msg: "شناسه دوره باید مثبت باشد" },
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "عنوان جلسه نمی‌تواند خالی باشد" },
        len: {
          args: [3, 100],
          msg: "عنوان جلسه باید بین 3 تا 100 کاراکتر باشد",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "توضیحات نمی‌تواند بیشتر از 500 کاراکتر باشد",
        },
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: "تاریخ معتبر نیست" },
        isAfterNow(value) {
          if (new Date(value) <= new Date()) {
            throw new Error("تاریخ جلسه باید در آینده باشد");
          }
        },
      },
    },
    duration: {
      type: DataTypes.INTEGER, // دقیقه
      allowNull: false,
      defaultValue: 90,
      validate: {
        isInt: { msg: "مدت زمان باید عدد باشد" },
        min: { args: [15], msg: "مدت زمان باید حداقل 15 دقیقه باشد" },
        max: { args: [480], msg: "مدت زمان نمی‌تواند بیشتر از 8 ساعت باشد" },
      },
    },
    status: {
      type: DataTypes.ENUM(
        "scheduled",
        "in_progress",
        "completed",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "scheduled",
      validate: {
        isIn: {
          args: [["scheduled", "in_progress", "completed", "cancelled"]],
          msg: "وضعیت باید یکی از scheduled، in_progress، completed یا cancelled باشد",
        },
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: "مکان نمی‌تواند بیشتر از 100 کاراکتر باشد",
        },
      },
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "حداکثر تعداد دانشجویان باید عدد باشد" },
        min: { args: [1], msg: "حداکثر تعداد دانشجویان باید حداقل 1 باشد" },
      },
    },
  },
  {
    modelName: "Session",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Enrollment Model
const Enrollment = sequelize.define(
  "Enrollment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه کاربر باید عدد باشد" },
        min: { args: [1], msg: "شناسه کاربر باید مثبت باشد" },
      },
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه دوره باید عدد باشد" },
        min: { args: [1], msg: "شناسه دوره باید مثبت باشد" },
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "accepted",
        "rejected",
        "completed",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: {
          args: [["pending", "accepted", "rejected", "completed", "cancelled"]],
          msg: "وضعیت باید یکی از pending، accepted، rejected، completed یا cancelled باشد",
        },
      },
    },
    enrollmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: { msg: "تاریخ ثبت‌نام معتبر نیست" },
      },
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: "تاریخ تکمیل معتبر نیست" },
      },
    },
    grade: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: { args: [0], msg: "نمره نمی‌تواند کمتر از 0 باشد" },
        max: { args: [100], msg: "نمره نمی‌تواند بیشتر از 100 باشد" },
      },
    },
    certificateIssued: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    certificateIssueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: "تاریخ صدور گواهی معتبر نیست" },
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "یادداشت نمی‌تواند بیشتر از 500 کاراکتر باشد",
        },
      },
    },
  },
  {
    modelName: "Enrollment",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Attendance Model
const Attendance = sequelize.define(
  "Attendance",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    enrollmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه ثبت‌نام باید عدد باشد" },
        min: { args: [1], msg: "شناسه ثبت‌نام باید مثبت باشد" },
      },
    },
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه جلسه باید عدد باشد" },
        min: { args: [1], msg: "شناسه جلسه باید مثبت باشد" },
      },
    },
    present: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    arrivalTime: {
      type: DataTypes.TIME,
      allowNull: true,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
        msg: "زمان ورود معتبر نیست",
      },
    },
    departureTime: {
      type: DataTypes.TIME,
      allowNull: true,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
        msg: "زمان خروج معتبر نیست",
      },
    },
    lateMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isInt: { msg: "دقایق تاخیر باید عدد باشد" },
        min: { args: [0], msg: "دقایق تاخیر نمی‌تواند منفی باشد" },
      },
    },
    earlyDepartureMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isInt: { msg: "دقایق خروج زودهنگام باید عدد باشد" },
        min: { args: [0], msg: "دقایق خروج زودهنگام نمی‌تواند منفی باشد" },
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 200],
          msg: "یادداشت نمی‌تواند بیشتر از 200 کاراکتر باشد",
        },
      },
    },
    recordedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه ثبت‌کننده باید عدد باشد" },
        min: { args: [1], msg: "شناسه ثبت‌کننده باید مثبت باشد" },
      },
    },
    recordingMethod: {
      type: DataTypes.ENUM(
        "manual",
        "automatic",
        "qr_code",
        "face_recognition"
      ),
      allowNull: false,
      defaultValue: "manual",
      validate: {
        isIn: {
          args: [["manual", "automatic", "qr_code", "face_recognition"]],
          msg: "روش ثبت باید یکی از manual، automatic، qr_code یا face_recognition باشد",
        },
      },
    },
  },
  {
    modelName: "Attendance",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Payment Model
const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه کاربر باید عدد باشد" },
        min: { args: [1], msg: "شناسه کاربر باید مثبت باشد" },
      },
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه دوره باید عدد باشد" },
        min: { args: [1], msg: "شناسه دوره باید مثبت باشد" },
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: "مبلغ باید عدد باشد" },
        min: { args: [0], msg: "مبلغ نمی‌تواند منفی باشد" },
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "paid",
        "failed",
        "refunded",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: {
          args: [["pending", "paid", "failed", "refunded", "cancelled"]],
          msg: "وضعیت باید یکی از pending، paid، failed، refunded یا cancelled باشد",
        },
      },
    },
    paymentMethod: {
      type: DataTypes.ENUM("cash", "card", "bank_transfer", "online", "check"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["cash", "card", "bank_transfer", "online", "check"]],
          msg: "روش پرداخت باید یکی از cash، card، bank_transfer، online یا check باشد",
        },
      },
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: {
          args: [0, 100],
          msg: "شناسه تراکنش نمی‌تواند بیشتر از 100 کاراکتر باشد",
        },
      },
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: "تاریخ پرداخت معتبر نیست" },
      },
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: "تاریخ سررسید معتبر نیست" },
      },
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        isDecimal: { msg: "مبلغ تخفیف باید عدد باشد" },
        min: { args: [0], msg: "مبلغ تخفیف نمی‌تواند منفی باشد" },
      },
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        isDecimal: { msg: "مبلغ مالیات باید عدد باشد" },
        min: { args: [0], msg: "مبلغ مالیات نمی‌تواند منفی باشد" },
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: "مبلغ کل باید عدد باشد" },
        min: { args: [0], msg: "مبلغ کل نمی‌تواند منفی باشد" },
      },
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "IRR",
      validate: {
        isIn: {
          args: [["IRR", "USD", "EUR"]],
          msg: "واحد پول باید IRR، USD یا EUR باشد",
        },
      },
    },
    receiptNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: {
          args: [0, 50],
          msg: "شماره رسید نمی‌تواند بیشتر از 50 کاراکتر باشد",
        },
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "یادداشت نمی‌تواند بیشتر از 500 کاراکتر باشد",
        },
      },
    },
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "شناسه پردازش‌کننده باید عدد باشد" },
        min: { args: [1], msg: "شناسه پردازش‌کننده باید مثبت باشد" },
      },
    },
  },
  {
    modelName: "Payment",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

async function initAssociations() {
  // User associations
  User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
  User.hasMany(Course, { as: "courses", foreignKey: "teacherId" });
  User.hasMany(Enrollment, { as: "enrollments", foreignKey: "userId" });
  User.hasMany(Payment, { as: "payments", foreignKey: "userId" });
  User.hasMany(Attendance, {
    as: "recordedAttendance",
    foreignKey: "recordedBy",
  });
  User.hasMany(RefreshToken, { as: "refreshTokens", foreignKey: "userId" });

  // Course associations
  Course.belongsTo(User, { as: "teacher", foreignKey: "teacherId" });
  Course.hasMany(Session, { as: "sessions", foreignKey: "courseId" });
  Course.hasMany(Enrollment, { as: "enrollments", foreignKey: "courseId" });
  Course.hasMany(Payment, { as: "payments", foreignKey: "courseId" });

  // Session associations
  Session.belongsTo(Course, { as: "course", foreignKey: "courseId" });
  Session.hasMany(Attendance, { as: "attendance", foreignKey: "sessionId" });

  // Enrollment associations
  Enrollment.belongsTo(User, { as: "user", foreignKey: "userId" });
  Enrollment.belongsTo(Course, { as: "course", foreignKey: "courseId" });
  Enrollment.hasMany(Attendance, {
    as: "attendance",
    foreignKey: "enrollmentId",
  });

  // Attendance associations
  Attendance.belongsTo(Enrollment, {
    as: "enrollment",
    foreignKey: "enrollmentId",
  });
  Attendance.belongsTo(Session, { as: "session", foreignKey: "sessionId" });
  Attendance.belongsTo(User, {
    as: "recordedByUser",
    foreignKey: "recordedBy",
  });

  // Payment associations
  Payment.belongsTo(User, { as: "user", foreignKey: "userId" });
  Payment.belongsTo(Course, { as: "course", foreignKey: "courseId" });

  // RefreshToken associations
  RefreshToken.belongsTo(User, { as: "user", foreignKey: "userId" });

  // RBAC associations
  Role.hasMany(RolePermission, {
    foreignKey: "roleId",
    sourceKey: "id",
    as: "rolePermissions",
  });
  Permission.hasMany(RolePermission, {
    foreignKey: "permissionId",
    sourceKey: "id",
    as: "rolePermissions",
  });
  RolePermission.belongsTo(Role, {
    foreignKey: "roleId",
    targetKey: "id",
    as: "role",
  });
  RolePermission.belongsTo(Permission, {
    foreignKey: "permissionId",
    targetKey: "id",
    as: "permission",
  });
  Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: "roleId",
    otherKey: "permissionId",
    as: "permissions",
  });
  Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: "permissionId",
    otherKey: "roleId",
    as: "roles",
  });
}

module.exports = {
  sequelize,
  User,
  Course,
  Session,
  Enrollment,
  Attendance,
  Payment,
  RefreshToken,
  Role,
  Permission,
  RolePermission,
  initAssociations,
};
