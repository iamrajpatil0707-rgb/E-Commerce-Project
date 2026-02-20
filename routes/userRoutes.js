const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware"); 

// --- PUBLIC ROUTES ---
router.post("/", userController.createUser);
router.post("/login", userController.loginUser);

// --- PROTECTED ROUTES (Profile Management) ---
router.get("/:id", authMiddleware, checkPermission('manage_own_profile', 'manage_users', 'read_users'), userController.getUserById);
router.put("/:id", authMiddleware, checkPermission('manage_own_profile', 'manage_users', 'assign_roles'), userController.updateUser);
router.post("/update-password/:id", authMiddleware, checkPermission('manage_own_profile', 'manage_users'), userController.simplePasswordUpdate);

// --- ADMIN / MANAGEMENT ROUTES ---
router.get("/", authMiddleware, checkPermission('manage_users', 'read_users'), userController.getAllUsers);
router.delete("/:id", authMiddleware, checkPermission('manage_users'), userController.deleteUser);

module.exports = router;
