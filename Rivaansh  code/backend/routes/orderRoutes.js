const express = require('express');
const orderController = require('../controllers/orderController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

const router = express.Router();

router.route('/')
      .post(protect, upload.single('prescription'), orderController.addOrderItems)
      .get(protect, admin, orderController.getOrders);

router.route('/myorders').get(protect, orderController.getMyOrders);
module.exports = router;
