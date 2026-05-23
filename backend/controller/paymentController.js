const crypto = require('crypto');
const Razorpay = require('razorpay');
const { buildOrderItems } = require('./orderController');

const createOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay credentials are missing" });
    }

    const { totalAmount } = await buildOrderItems(req.body.items);
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    // Razorpay accepts amount in paise
    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
    };
    
    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send("Some error occured");
    res.json({ ...order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ message: error.message || "Payment order creation failed" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Payment verification failed" });
  }
};

module.exports = { createOrder, verifyPayment };
