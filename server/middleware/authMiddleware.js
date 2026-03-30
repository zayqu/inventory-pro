import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and is valid
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing after Bearer",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || (!decoded.id && !decoded._id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Find user
    const user = await User.findById(decoded.id || decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error in middleware",
    });
  }
};

// Add this at the bottom of your existing file, before the export

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to perform this action"
            });
        }
        next();
    };
};

export { authMiddleware as default, restrictTo };