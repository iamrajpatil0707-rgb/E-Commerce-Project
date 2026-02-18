const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware"); 

// --- PUBLIC ROUTES ---

// Signup Route (Create User)
router.post("/", userController.createUser);

// Login Route
router.post("/login", userController.loginUser);


// Find Password Route   // only for ttesting, remove in production
router.post("/findpassword", userController.findpassword);


// --- PROTECTED ROUTES (Requires Login) ---

// Get User by ID (User must be logged in)
router.get("/:id", authMiddleware, userController.getUserById);

// Update User (User must be logged in)
router.put("/:id", authMiddleware, userController.updateUser);

// Change Password (User must be logged in)
router.post("/update-password/:id", authMiddleware, userController.simplePasswordUpdate);


// --- ADMIN ONLY ROUTES ---

// Get all users (Only Admin can see everyone)
router.get("/",
  authMiddleware,
  allowRoles("admin"), 
  userController.getAllUsers
);

// Delete user (Only Admin can delete)
router.delete(
  "/:id",
  authMiddleware,
  allowRoles("admin", "root"), 
  userController.deleteUser
);

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const userController = require("../controllers/userController");
// const authMiddleware = require("../middleware/authMiddleware");
// const { allowRoles } = require("../middleware/roleMiddleware");

// // Admin only
// router.get(
//   "/",
//   authMiddleware,
//   allowRoles("admin"),
//   userController.getAllUsers
// );

// // Admin only
// router.delete(
//   "/:id",
//   authMiddleware,
//   allowRoles("admin"),
//   userController.deleteUser
// );


// router.get('/login', (req, res) => {
//     res.json({message: 'this is login route'});
// });


// // Public (signup)
// router.post("/", userController.createUser);

// module.exports = router;

// router.put('/:id', userController.updateUser);
// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/userController');

// // Get all users
// router.get('/', userController.getAllUsers);

// // Get user by ID
// router.get('/:id', userController.getUserById);

// // Create new user
// router.post('/', userController.createUser);

// Update user


// // Delete user
// router.delete('/:id', userController.deleteUser);

// module.exports = router;
