const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Confirmed", "Delivered", "Cancelled"], default: "Pending" },
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
  paymentProvider: { type: String, enum: ["razorpay", "paypal", "cod", "unknown"], default: "unknown" },
  paymentId: { type: String },
  userName: { type: String, default: "Guest User" },
  address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
