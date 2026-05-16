import dotenv from 'dotenv';
const result = dotenv.config();

if (result.error) {
  console.error("[Dotenv] Error loading .env file:", result.error);
} else {
  console.log("[Dotenv] .env file loaded successfully (Pre-load)");
}
