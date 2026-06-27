import express from "express";
import { registerRoutes } from "../server/routes";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

// Initialize your routes asynchronously without standard http.listen()
const initApp = async () => {
  // Pass a mock object or minimal implementation if your registerRoutes absolutely needs an httpServer instance.
  // If registerRoutes only attaches app.get/app.post, passing an empty object or dynamic dummy server works.
  const { createServer } = await import("http");
  const dummyServer = createServer(app);
  
  await registerRoutes(dummyServer, app);
};

// Vercel serverless environment handler
export default async (req: any, res: any) => {
  await initApp();
  return app(req, res);
};
