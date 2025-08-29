/**
 * Middleware for json-server to simulate API failures
 * This helps test optimistic update rollback functionality
 */

const FAILURE_RATE = 0.1; // 10% failure rate

module.exports = (req, res, next) => {
  // Only apply failure simulation to mutation requests
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);

  if (isMutation && Math.random() < FAILURE_RATE) {
    // Simulate random API errors
    const errors = [
      { status: 500, message: "Internal Server Error" },
      { status: 503, message: "Service Temporarily Unavailable" },
      { status: 504, message: "Gateway Timeout" },
      { status: 502, message: "Bad Gateway" },
    ];

    const error = errors[Math.floor(Math.random() * errors.length)];

    console.log(
      `[Mock API] Simulating ${error.status} error for ${req.method} ${req.url}`
    );

    // Add a small delay to simulate network latency
    setTimeout(() => {
      res.status(error.status).json({
        error: error.message,
        message: "Simulated failure for testing optimistic updates",
        timestamp: new Date().toISOString(),
      });
    }, 300);
  } else {
    // Log successful requests
    console.log(`[Mock API] ${req.method} ${req.url} - OK`);

    // Add CORS headers for development
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,PUT,POST,DELETE,PATCH,OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Content-Length, X-Requested-With"
    );

    // Continue to json-server router
    next();
  }
};
