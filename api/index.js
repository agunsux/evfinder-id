// Vercel Serverless Function entry point
import { serverReady } from '../server.js';

let app;

export default async function handler(req, res) {
  if (!app) {
    app = await serverReady;
  }
  return app(req, res);
}
