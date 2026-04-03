const express = require("express");
const router = express.Router();
const orderCtrl = require("../controllers/orderController");

// Task 4: Order REST API Routes
router.get("/", orderCtrl.getAllOrders);
router.post("/", orderCtrl.createOrder);
router.put("/:id", orderCtrl.updateOrderStatus);
router.post("/:id/payment-confirmation", orderCtrl.paymentConfirmation);
router.post("/webhook/razorpay", orderCtrl.razorpayWebhook);
router.post("/webhook/paypal", orderCtrl.paypalWebhook);

module.exports = router;
