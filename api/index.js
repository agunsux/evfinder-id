// Vercel Serverless Function entry point
import app from '../server.js';

export default function handler(req, res) {
  return app(req, res);
}
