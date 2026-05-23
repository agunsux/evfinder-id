import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

// Ensure environment variables exist
const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
export const bucketName = process.env.R2_BUCKET_NAME;
export const publicDomain = process.env.R2_PUBLIC_DOMAIN;

let s3 = null;

if (accountId && accessKeyId && secretAccessKey) {
  s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
}

/**
 * Checks if the file exists in R2
 * @param {string} filename 
 * @returns {Promise<boolean>}
 */
export async function checkAudioCache(filename) {
  if (!s3 || !bucketName) return false;
  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: filename,
    });
    await s3.send(command);
    return true; // File exists
  } catch (error) {
    if (error.name === 'NotFound') {
      return false; // File doesn't exist
    }
    console.warn(`[R2 Storage] Error checking cache for ${filename}:`, error.message);
    return false;
  }
}

/**
 * Uploads audio buffer to R2
 * @param {string} filename 
 * @param {Buffer|string} base64Content 
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export async function uploadAudioToR2(filename, base64Content) {
  if (!s3 || !bucketName || !publicDomain) {
    throw new Error("R2 is not properly configured.");
  }
  
  try {
    const buffer = Buffer.isBuffer(base64Content) ? base64Content : Buffer.from(base64Content, 'base64');
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      Body: buffer,
      ContentType: "audio/mp3",
      // Optional: Add cache control for CDN optimization
      CacheControl: "public, max-age=31536000, immutable",
    });

    await s3.send(command);
    
    // Return the public URL
    const cleanDomain = publicDomain.endsWith('/') ? publicDomain.slice(0, -1) : publicDomain;
    return `${cleanDomain}/${filename}`;
  } catch (error) {
    console.error(`[R2 Storage] Error uploading ${filename}:`, error);
    throw error;
  }
}

/**
 * Returns the expected public URL for a filename
 * @param {string} filename 
 * @returns {string|null}
 */
export function getAudioPublicUrl(filename) {
  if (!publicDomain) return null;
  const cleanDomain = publicDomain.endsWith('/') ? publicDomain.slice(0, -1) : publicDomain;
  return `${cleanDomain}/${filename}`;
}
