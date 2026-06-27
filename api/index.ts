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

const dummyServer = createServer(app);

// Pre-register your application routes
registerRoutes(dummyServer, app).catch((err) => {
  console.error("Serverless route registration failed:", err);
});

export default app;
