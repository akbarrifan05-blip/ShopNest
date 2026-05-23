const express = require("express");
const { createOrder, verifyPayment } = require('../controller/paymentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();


router.post("/order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

module.exports = router;
