import express from "express";
import { registerRoutes } from "../server/routes";
import cors from "cors";
import { createServer } from "http";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({
  verify: (req: any, _res, buf) => { req.rawBody = buf; }
}));
app.use(express.urlencoded({ extended: false }));

// Pre-register the routes to the app instance cleanly
const dummyServer = createServer(app);
registerRoutes(dummyServer, app).catch((err) => {
  console.error("Failed to register serverless routes:", err);
});

// Export the application instance directly for Vercel's serverless handler
export default app;
