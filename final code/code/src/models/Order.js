const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Delivered", "Cancelled"], default: "Pending" },
  userName: { type: String, default: "Guest User" },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
