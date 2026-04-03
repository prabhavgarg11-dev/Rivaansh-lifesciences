const express = require("express");
const router = express.Router();
const orderCtrl = require("../controllers/orderController");

// Task 4: Order Routes
router.get("/", orderCtrl.getAllOrders);
router.post("/", orderCtrl.createOrder);
router.put("/:id", orderCtrl.updateOrderStatus);

module.exports = router;
