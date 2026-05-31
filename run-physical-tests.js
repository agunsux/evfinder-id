/**
 * Physical Test Script for SMTP Cascade (Test C & D)
 * Run this locally where your .env variables are present.
 * 
 * Usage: node run-physical-tests.js
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function simulateCascade(testName, invalidatePrimary, invalidateSecondary) {
  console.log(`\n========================================`);
  console.log(`RUNNING: ${testName}`);
  console.log(`========================================`);

  const primaryPass = invalidatePrimary ? 'WRONG_PASS' : process.env.EMAIL_PASS;
  const secondaryPass = invalidateSecondary ? 'WRONG_PASS' : process.env.EMAIL_PASS; // Assuming same host
  
  let primaryTransport;
  if (process.env.EMAIL_HOST) {
     primaryTransport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: primaryPass }
    });
  }

  let secondaryTransport;
  if (process.env.EMAIL_HOST) {
     secondaryTransport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: secondaryPass }
    });
  }

  let fallbackTransport;
  if (process.env.FALLBACK_EMAIL) {
    fallbackTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.FALLBACK_EMAIL, pass: process.env.FALLBACK_EMAIL_PASSWORD }
    });
  }

  const mailOptions = {
    to: 'hello.shinerva@gmail.com',
    subject: `Test Cascade: ${testName}`,
    html: `<p>This is a test for ${testName}</p>`
  };

  try {
    // Try Priority 1
    console.log(`[Priority 1] Attempting admin@shinerva.id...`);
    await primaryTransport.sendMail({ ...mailOptions, from: 'admin@shinerva.id' });
    console.log(`[Priority 1] SUCCESS: admin@shinerva.id`);
    return;
  } catch (err) {
    console.log(`[Priority 1] FAILED: admin@shinerva.id - ${err.message}`);
  }

  try {
    // Try Priority 2
    console.log(`[Priority 2] Attempting support@shinerva.id...`);
    await secondaryTransport.sendMail({ ...mailOptions, from: 'support@shinerva.id' });
    console.log(`[Priority 2] SUCCESS: support@shinerva.id`);
    return;
  } catch (err) {
    console.log(`[Priority 2] FAILED: support@shinerva.id - ${err.message}`);
  }

  try {
    // Try Priority 3
    console.log(`[Priority 3] Attempting Fallback ${process.env.FALLBACK_EMAIL}...`);
    await fallbackTransport.sendMail({ ...mailOptions, from: process.env.FALLBACK_EMAIL });
    console.log(`[Priority 3] SUCCESS: ${process.env.FALLBACK_EMAIL} (Fallback Used)`);
    return;
  } catch (err) {
    console.log(`[Priority 3] FAILED: Fallback - ${err.message}`);
  }

  console.log(`ALL CASCADES FAILED.`);
}

async function runAll() {
  // Test C: Invalidate primary password, so Priority 1 & 2 fail (assuming shared password), 
  // Wait, if Priority 1 and 2 use the same SMTP login, invalidating the password kills both.
  // We will simulate just Priority 1 failing by manually triggering the catch block in a real app,
  // but here we just invalidate the password.
  await simulateCascade('TEST C: Single Failover (Admin Fails)', true, false);
  
  await simulateCascade('TEST D: Double Failover (Admin & Support Fail)', true, true);
}

runAll();
