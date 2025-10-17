import { app } from "./app.js";
import { connectDB } from "./config/db.js";

const port = process.env.PORT || 3000;

(async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
})();
