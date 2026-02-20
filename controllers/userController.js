const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

// 1. LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Early validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email Credentials" });
    }

    // Compare Password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid pass Credentials" });
    }

    // Create Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// exports.findpassword = async (req, res) => {
//   try {
//     const { email } = req.body;   
//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ success: false, message: "Invalid email Credentials" });
//     }   

//     res.status(200).json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         role: user.role,    
//         password: user.password
//       }
//     });
//   }   
//   catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// 2. CREATE NEW USER (Signup)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = 'user';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = new User({ name, email, password, role });
    const savedUser = await user.save();
    
    res.status(201).json({
      success: true,
      data: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      },
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 3. GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateUser = async (req, res) => {
  try {
    // 1. Check if user is logged in
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const targetUserId = req.params.id;
    const isOwner = req.user.id === targetUserId; // Is the user updating their own profile?
    
    // 2. Fetch the target user from the database (the user to be edited)
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 3. THE FULL 11-LEVEL RANKING SYSTEM
    const roleLevels = {
      'user': 1,         // Lowest level
      'support': 2,
      'delivery': 3,
      'vendor': 4,
      'marketing': 5,
      'sales': 6,
      'editor': 7,
      'manager': 8,      // Manager level 8
      'admin': 9, 
      'superuser': 10,
      'root': 11         // The Boss (Highest level)
    };        

    // // 3. THE RANKING SYSTEM (Define levels)
    // const roleLevels = {
    //   'user': 1,
    //   'manager': 2,
    //   'admin': 3,
    //   'superuser': 4,
    //   'root': 5
    // };

    const myLevel = roleLevels[req.user.role];        // Authority level of logged-in user
    const targetLevel = roleLevels[targetUser.role];  // Authority level of target user

    // 4. BASIC PROFILE EDITING RULES (Name, Phone, etc.)
    // If I am not editing my own profile, my level must be higher than target's level
    if (!isOwner && myLevel <= targetLevel) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied: You cannot modify profiles of users at your level or higher!" 
      });
    }

    // 5. ROLE CHANGE RULES (Who can assign which roles?)
    if (req.body.role) {
      
      // Gatekeeper Check: Only these 4 roles can assign roles
      const allowedToAssignRoles = ['manager', 'admin', 'superuser', 'root'];
      if (!allowedToAssignRoles.includes(req.user.role)) {
         return res.status(403).json({
            success: false,
            message: "Access denied: Only Manager, Admin, Superuser, or Root can assign roles!"
         });
      }

      // Define the level of the new role (This should not be commented out!)
      const newRoleLevel = roleLevels[req.body.role];

      // Rule A: No one can change their own role
      if (isOwner) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You cannot upgrade or change your own role!"
        });
      }

      // Rule B: Rank check + Root Exception
      if (myLevel <= newRoleLevel && req.user.role !== 'root') {
         return res.status(403).json({
           success: false,
           message: `Access denied: You cannot assign '${req.body.role}' role as it is beyond your authority level.`
         });
      }
    }

    // 6. Security Measure: Password should not be changed here (there is a separate route for it)
    if (req.body.password) {
      delete req.body.password;
    }

    // 7. Audit Trail: Record who made the update
    req.body.updatedBy = req.user._id;
    
    // 8. Final Update in Database
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      req.body,
      { new: true, runValidators: true }
    ).select('-password'); // Return data without password
    
    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User profile updated successfully'
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 5. UPDATE USER
// exports.updateUser = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ success: false, message: 'User not authenticated' });
//     }
//     const isOwner = req.user.id === req.params.id;
//     const isAdmin = req.user.role === 'admin' || req.user.role === 'root';
//     if (!isOwner && !isAdmin) {
//       return res.status(403).json({ success: false, message: 'Access denied' });
//     }

//     // Security: Don't allow password update here
//     if (req.body.password) {
//       delete req.body.password;
//     }

//     if (req.body.role && !isAdmin) {
//       return res.status(403).json({ success: false, message: 'Only admins can change roles' });
//     }

//     req.body.updatedBy = req.user._id;
    
//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     ).select('-password');
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
//     res.status(200).json({
//       success: true,
//       data: user,
//       message: 'User updated successfully'
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };


exports.simplePasswordUpdate = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const targetUserId = req.params.id; // The ID from the URL /:id

    // Check: Is the person logged in the Owner OR an Admin?
    const isOwner = req.user.id === targetUserId;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superuser' || req.user.role === 'root';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: "Access Denied: You can only change your own password (unless you are an Admin)" 
      });
    }

    // Find the actual user being targeted
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = newPassword;
    await user.save(); // Triggers hashing hook

    res.status(200).json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 6. DELETE USER
// 6. DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // 1. First find the target user (Do not delete directly!)
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 2. THE FULL 11-LEVEL RANKING SYSTEM
    const roleLevels = {
      'user': 1,         
      'support': 2,
      'delivery': 3,
      'vendor': 4,
      'marketing': 5,
      'sales': 6,
      'editor': 7,
      'manager': 8,      
      'admin': 9, 
      'superuser': 10,
      'root': 11         
    };

    const myLevel = roleLevels[req.user.role];        // Authority level of the user performing deletion
    const targetLevel = roleLevels[targetUser.role];  // Authority level of the user being deleted

    // 3. HIERARCHY CHECK (Rank Rule)
    // You cannot delete users at your level or higher
    // Exception: 'root' can delete anyone
    if (myLevel <= targetLevel && req.user.role !== 'root') {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied: You cannot delete a '${targetUser.role}' user. This action is beyond your authority level!` 
        });
    }

    // 4. If everything is valid, proceed with deletion
    await User.findByIdAndDelete(targetUserId);
    
    res.status(200).json({ success: true, message: `User (${targetUser.role}) deleted successfully!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// exports.deleteUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
//     res.status(200).json({ success: true, message: 'User deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

