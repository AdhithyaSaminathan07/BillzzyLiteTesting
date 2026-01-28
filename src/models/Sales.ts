import mongoose, { Schema, models, Document } from "mongoose";

export interface ISale extends Document {
  tenantId: string;
  billId: string;
  amount: number;
  paymentMethod: "cash" | "qr-code" | "card";
  profit?: number;
  status: string;
  customerPhone: string;
  customerName?: string;
  merchantName?: string;
  discount?: number;
  items: { name: string; quantity: number; price: number }[];
  publicToken?: string;
  expiresAt?: Date;
  isEdited?: boolean;
  editCount?: number;
  updatedAt?: Date;
  createdAt: Date;
}

const SaleSchema = new Schema<ISale>({
  tenantId: { type: String, required: true, index: true },
  billId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["cash", "qr-code", "card"],
    required: true,
  },
  profit: { type: Number, default: 0 },
  status: { type: String, default: "pending" },
  customerPhone: { type: String },
  customerName: { type: String },
  merchantName: { type: String },
  discount: { type: Number, default: 0 },

  // ✅ ADDED: To store the cart items
  items: [{
    name: String,
    quantity: Number,
    price: Number
  }],

  // ✅ ADDED: Random Token for the link
  publicToken: {
    type: String,
    unique: true,
    sparse: true
  },

  // ✅ ADDED: Expiration Date
  expiresAt: {
    type: Date
  },

  // ✅ ADDED: Edited Flag
  isEdited: { type: Boolean, default: false },
  editCount: { type: Number, default: 0 },
  updatedAt: { type: Date },

  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'sales',
  timestamps: true // This will automatically manage createdAt and updatedAt
});

const Sale = models.Sale || mongoose.model<ISale>("Sale", SaleSchema);
export default Sale;
