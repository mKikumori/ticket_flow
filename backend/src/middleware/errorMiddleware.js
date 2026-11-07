// 404 error route handler
export function notFound(req, res, next) {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;

  next(error);
}

// Middleware to handle Errors and display them for the frontend
export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const duplicatedField = Object.keys(error.keyValue || {})[0];

    return res.status(409).json({
      message: duplicatedField
        ? `${duplicatedField} is already registered.`
        : "A record with this information already exists.",
    });
  }

  // Mongoose validation error
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: error.message,
    });
  }

  // Mongoose invalid ObjectId
  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format.",
    });
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    message: error.message || "An unknown error occurred.",
  });
}
