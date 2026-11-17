import Product from "../models/Product.js";
import KrogerProduct from "../models/KrogerProduct.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

// ^ place order cod: /api/order/cod
export const placeOrderCOD = async (request, response) => {
	try {
		console.log("========== placeOrderCOD ==========");
		const userId = request.user.id;
		const { items, address } = request.body;

		console.log("userId:", userId);
		console.log("items count:", items.length);
		console.log("address:", address);

		if (!address || items.length === 0) {
			return response.json({
				success: false,
				message: "Invalid data: missing address or items",
			});
		}

		const processedItems = [];
		let amount = 0;

		for (const item of items) {
			console.log(`\nProcessing item:`, {
				productId: item.productId,
				productSource: item.productSource,
				quantity: item.quantity,
			});

			let product = null;
			let itemPrice = 0;
			let itemName = "Unknown Product";

			if (item.productSource === "themealdb" || item.productSource === "kroger") {
				console.log(
					`Looking up external product by UPC/externalId: ${item.productId}`,
				);
				product = await KrogerProduct.findOne({
					$or: [
						{ upc: item.productId },
						{ externalId: item.productId },
						{ productId: item.productId },
					],
				});
				if (product) {
					itemPrice = product.offerPrice || product.price || 0;
					itemName =
						product.name || product.description || "External Product";
					console.log(
						`External product found: ${itemName}, Price: ${itemPrice}`,
					);
				} else {
					console.warn(
						`External product not found for: ${item.productId}`,
					);
					itemPrice = 0;
					itemName = "External Product (Not Found)";
				}
			} else {
				console.log(
					`Looking up local product with ObjectId: ${item.productId}`,
				);
				try {
					product = await Product.findById(item.productId);

					if (product) {
						itemPrice = product.offerPrice || product.price || 0;
						itemName = product.name || "Local Product";
						console.log(
							`Local product found: ${itemName}, Price: ${itemPrice}`,
						);
					} else {
						console.warn(
							`Local product not found: ${item.productId}`,
						);
						return response.json({
							success: false,
							message: `Product not found: ${item.productId}`,
						});
					}
				} catch (err) {
					console.error(
						`Invalid product ID format: ${item.productId}`,
						err.message,
					);
					return response.json({
						success: false,
						message: `Invalid product ID: ${item.productId}`,
					});
				}
			}

			const itemTotal = itemPrice * item.quantity;
			amount += itemTotal;

			console.log(
				`Item subtotal: ${itemPrice} × ${item.quantity} = ${itemTotal}`,
			);

			processedItems.push({
				product: item.productId,
				productSource: item.productSource,
				quantity: item.quantity,
				price: itemPrice,
				name: itemName,
			});
		}

		const tax = Math.floor(amount * 0.0785);
		const totalAmount = amount + tax;

		console.log(`\nOrder Summary:`);
		console.log(`Subtotal: ${amount}`);
		console.log(`Tax (7.85%): ${tax}`);
		console.log(`Total: ${totalAmount}`);

		const order = await Order.create({
			userId,
			items: processedItems,
			amount: totalAmount,
			address,
			paymentType: "cod",
			status: "pending",
		});

		console.log("✅ Order created with ID:", order._id);

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ $push: { orders: order._id } },
			{ new: true },
		);

		console.log(
			`Order linked to user. Total orders: ${updatedUser.orders.length}`,
		);

		return response.json({
			success: true,
			message: "Order placed successfully",
			orderId: order._id,
		});
	} catch (error) {
		console.error("Error in placeOrderCOD:", error.message);
		return response.json({
			success: false,
			message: error.message,
		});
	}
};

// ^ get user orders by id : /api/order/user
export const getUserOrders = async (request, response) => {
	try {
		console.log("========== getUserOrders ==========");
		const userId = request.user.id;
		console.log("userId:", userId);

		const orders = await Order.find({
			userId,
		})
			.populate({
				path: "address",
				model: "Address",
			})
			.sort({ createdAt: -1 });

		console.log(`Found ${orders.length} orders for user ${userId}`);

		response.json({
			success: true,
			orders,
		});
	} catch (error) {
		console.error("Error in getUserOrders:", error.message);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// ^ get all orders (admin) : /api/order/admin
export const getAllOrders = async (request, response) => {
	try {
		console.log("========== getAllOrders (Admin) ==========");
		const orders = await Order.find({})
			.populate({
				path: "address",
				model: "Address",
			})
			.sort({ createdAt: -1 });

		console.log(`Found ${orders.length} total orders`);

		response.json({
			success: true,
			orders,
		});
	} catch (error) {
		console.error("Error in getAllOrders:", error.message);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// ^ update order status : /api/order/:orderId
export const updateOrderStatus = async (request, response) => {
	try {
		const { orderId, status } = request.body;

		const order = await Order.findByIdAndUpdate(
			orderId,
			{ status },
			{ new: true },
		);

		if (!order) {
			return response.json({
				success: false,
				message: "Order not found",
			});
		}

		response.json({ success: true, message: "Status updated", order });
	} catch (error) {
		response.json({ success: false, message: error.message });
	}
};
