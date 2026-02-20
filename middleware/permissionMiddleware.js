const rolesHierarchy = require('../config/rolesConfig');

// This now accepts multiple permissions (array)
const checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const userRoleConfig = rolesHierarchy[req.user.role];
    
    if (!userRoleConfig) {
      return res.status(403).json({ success: false, message: "Invalid user role" });
    }

    // God Mode (Root) gets direct access
    if (userRoleConfig.permissions.includes('all')) {
      return next();
    }

    // Check if user has any one of the required permissions
    const hasPermission = requiredPermissions.some(perm => userRoleConfig.permissions.includes(perm));

    if (hasPermission) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: "Access denied: You do not have permission to perform this action!" 
    });
  };
};

module.exports = { checkPermission };
