import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware that ensures Google/ Gemini API keys are present.
 * Applied only to routes that need the AI engine (e.g., speech generation).
 */
export function validateAIKeys(req: Request, res: Response, next: NextFunction): void {
  const hasGoogleKey = !!process.env.GOOGLE_API_KEY;
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;

  if (!hasGoogleKey && !hasGeminiKey) {
    res.status(500).json({ error: 'AI engine keys not configured. Set GOOGLE_API_KEY or GEMINI_API_KEY.' });
    return;
  }
  next();
}
