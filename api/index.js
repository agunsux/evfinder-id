import app from '../server.js';

export default function handler(req, res) {
  // Log URL for potential debugging in Vercel logs
  console.log(`[API] ${req.method} ${req.url}`);
  
  // Forward to Express
  return app(req, res);
}
