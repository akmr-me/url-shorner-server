const config = require("../../config");
const URL = require("../../models/urlModel");
const winston = require("../../utils/logger/logger");

/**
 * Delete URL controller
 * Handles URL deletion with proper authorization checks
 */
const deleteUrl = async (req, res) => {
  const { id } = req.params;
  const { email, guestId } = req;

  // Input validation
  if (!id || !(email || guestId)) {
    return res.status(400).json({
      status: "error",
      message: "Missing required parameters",
    });
  }

  try {
    // Find URL with user data
    const url = await URL.findByShortWithUser(id);

    if (!url) {
      throw new Error("URL_NOT_FOUND");
    }

    // Authorization checks
    if (email && url.user?.email !== email) {
      throw new Error("UNAUTHORIZED");
    }

    if (guestId && url.guestId !== guestId) {
      throw new Error("UNAUTHORIZED");
    }

    // Soft delete by updating status
    const result = await URL.updateOne(
      { short: id },
      {
        $set: {
          status: "inactive",
          deletedAt: new Date(),
          deletedBy: email || guestId,
        },
      }
    );

    if (result.modifiedCount !== 1) {
      throw new Error("DELETE_FAILED");
    }

    // Log successful deletion
    winston.info("URL deleted successfully", {
      short: id,
      email: email || "guest",
      guestId: guestId || "none",
    });

    // Send success response
    return res.status(200).json({
      status: "success",
      message: "URL deleted successfully",
    });
  } catch (error) {
    // Handle specific errors
    switch (error.message) {
      case "URL_NOT_FOUND":
        return res.status(404).json({
          status: "error",
          message: "URL not found",
        });

      case "UNAUTHORIZED":
        return res.status(403).json({
          status: "error",
          message: "You are not authorized to delete this URL",
        });

      case "DELETE_FAILED":
        return res.status(400).json({
          status: "error",
          message: "Failed to delete URL",
        });

      default:
        winston.error("Error in deleteUrl:", {
          error: error.message,
          stack: error.stack,
          urlId: id,
        });

        return res.status(500).json({
          status: "error",
          message: "Internal server error",
        });
    }
  }
};

module.exports = deleteUrl;
