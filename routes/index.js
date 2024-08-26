const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const applicationController = require("../controllers/applicationContorler");
const upload = require("../middleware/upload");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../middleware/authMiddleware");

router.post("/register/admin", authController.registerAdmin);
router.post(
  "/register/user",
  upload.single("photo"),
  authController.registerUser
);
router.post("/login", authController.login);
router.get("/confirm/:token", authController.confirmEmail);
router.get("/profile", authenticateToken, authController.getProfile);

// Application
router.post(
  "/application",
  authenticateToken,
  isUser,
  applicationController.createApplication
);
router.get(
  "/applications",
  authenticateToken,
  isUser,
  applicationController.getUserApplications
);
router.get(
  "/application",
  authenticateToken,
  isUser,
  applicationController.getApplicationById
);

router.put(
  "/user/application/edit",
  authenticateToken,
  isUser,
  applicationController.editApplicationForUser
);


// Routes untuk Admin
router.get(
  "/admin/applications",
  authenticateToken,
  isAdmin,
  applicationController.getAllApplications
);
router.get(
  "/admin/application/user/:id",
  authenticateToken,
  isAdmin,
  applicationController.getApplicationByIdForAdmin
);


// router.put(
//   "/admin/application/edit/:id",
//   authenticateToken,
//   isAdmin,
//   applicationController.editApplication
// );

router.put(
  "/users/:id/status",
  authenticateToken,
  isAdmin,
  applicationController.updateApplicationStatus
);
router.put(
  "/admin/application/edit/:id",
  authenticateToken,
  isAdmin,
  applicationController.editApplication
);

router.get(
  "/admin/users",
  authenticateToken,
  isAdmin,
  authController.getListUsers
);
router.put(
  "/user/editProfile",
  authenticateToken,
  isUser,
  upload.single("photo"),
  authController.editProfile
);


module.exports = router;
