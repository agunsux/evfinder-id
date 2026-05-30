import express from 'express';
import { createMidtransToken } from '../controllers/midtransController.js';

const router = express.Router();

// POST /api/checkout/midtrans
router.post('/midtrans', createMidtransToken);

export default router;
