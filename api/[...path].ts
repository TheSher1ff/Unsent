import express from "express";
import cors from "cors";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";

// Vercel reuses warm serverless instances between invocations, so build the
// app + register routes once per cold start and cache it — not once per request.
let appPromise: Promise<express.Express> | null = null;

function buildApp(): Promise<express.Express> {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: false }));

  // registerRoutes expects an http.Server for parity with server/index.ts,
  // but nothing in it actually needs to listen() in the serverless context.
  const dummyServer = createServer(app);

  return registerRoutes(dummyServer, app)
    .then(() => app)
    .catch((err) => {
      console.error("Serverless route registration failed:", err);
      throw err;
    });
}

export default async function handler(req: any, res: any) {
  if (!appPromise) {
    appPromise = buildApp();
  }
  const app = await appPromise;
  return app(req, res);
}
