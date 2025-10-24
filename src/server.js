// src/server.js
import { app } from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 3000;

(async function start() {
  try {
    await connectDB(); // ✅ single DB connect + index sync
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

    // Graceful shutdown on SIGINT/SIGTERM
    const shutdown = (signal) => {
      console.log(`\n${signal} received — shutting down gracefully…`);
      server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });
      // Force-exit if something hangs
      setTimeout(() => {
        console.warn("Forcing shutdown...");
        process.exit(1);
      }, 10_000).unref();
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    // Surface unhandled promise errors
    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
    });
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      // Optionally exit; many apps prefer to crash & restart
      // process.exit(1);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
