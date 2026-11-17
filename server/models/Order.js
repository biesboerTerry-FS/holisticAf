import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			ref: "User",
		},
		items: [
			{
				product: {
					type: String,
					required: true,
				},
				productSource: {
					type: String,
					enum: ["local", "kroger", "themealdb"],
					default: "local",
				},
				quantity: {
					type: Number,
					required: true,
				},
				price: {
					type: Number,
					default: 0,
				},
				name: {
					type: String,
					default: "Unknown Product",
				},
			},
		],
		amount: {
			type: Number,
			required: true,
		},
		address: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Address",
		},
		paymentType: {
			type: String,
			required: true,
		},
		isPaid: {
			type: Boolean,
			default: false,
		},
		status: {
			type: String,
			enum: [
				"pending",
				"processing",
				"shipped",
				"delivered",
				"cancelled",
			],
			default: "pending",
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true },
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
