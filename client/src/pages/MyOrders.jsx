import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets.js";

const MyOrders = () => {
	const [myOrders, setMyOrders] = useState([]);

	const { axios, currency, user, isAuthLoading } = useAppContext();

	useEffect(() => {
		if (!isAuthLoading && user?.clerkId) {
			fetchMyOrders();
		}
	}, [user, isAuthLoading]);

	const fetchMyOrders = async () => {
		try {
			const { data } = await axios.get("/api/order/user");
			if (data.success) {
				setMyOrders(data.orders);
			}
		} catch (error) {
			console.error("Order fetch error:", error);
		}
	};
	return (
		<div className="mt-16 pb-16 ">
			<div className="flex flex-col items-end w-max mb-">
				<p className="text-2xl font-medium text-primary-forest-green">
					my{" "}
					<span className="text-secondary-golden-honey">
						orders
					</span>{" "}
				</p>
				<div className="w-16 h-0.5 rounded-full"></div>
			</div>
			{myOrders.map((order, index) => (
				<div
					key={index}
					className="border border-primary-forest-green bg-primary-sage-green/30 rounded-lg mb-10 p-4 py-5 max-w-4xl"
				>
					<p className="flex justify-between md:items-center text-primary-forest-green md:font-medium max-md:flex-col">
						<span>order ID: {order._id}</span>
						<span>payment: {order.paymentType}</span>
						<span>
							total: {currency}
							{order.amount}
						</span>
					</p>
					{order.items.map((item, index) => (
						<div
							key={index}
							className={`relative text-primary-forest-green/70 ${
								order.items.length !== index + 1 && "border-b"
							} border-primary-forest-greenflex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`}
						>
							<div className="flex items-center mb-4 md:mb-0">
								<div className=" p-4 rounded-lg">
									<img
										className="w-16 h-16 object-contain"
										src={
											(item.productSource === "themealdb" ||
												item.productSource === "kroger") &&
											item.upc
												? `/api/media/image?upc=${item.upc}`
												: assets.leaf
										}
										alt={item.name}
									/>
								</div>
								<div className="ml-4">
									<h2 className="text-xl font-medium text-primary-forest-green">
										{item.name}
									</h2>
									<p>category: {item.productSource}</p>
								</div>
							</div>
							<div className="flex flex-col justify-center md:ml-8 mb-4 md:mb-0">
								<p>quantity: {item.quantity || "1"}</p>
								<p>status: {order.status}</p>
								<p>
									date:{" "}
									{new Date(
										order.createdAt,
									).toLocaleDateString()}
								</p>
							</div>
							<p className="text-primary-forest-green text-lg font-medium">
								amount: {currency}{" "}
								{(item.price * item.quantity).toFixed(2)}
							</p>
						</div>
					))}
				</div>
			))}
		</div>
	);
};

export default MyOrders;
