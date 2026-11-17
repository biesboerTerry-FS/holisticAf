import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets, dummyAddress } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
	const {
		axios,
		cartItems,
		currency,
		getCartAmount,
		getCartCount,
		navigate,
		products,
		removeFromCart,
		setCartItems,
		updateCartItems,
		user,
	} = useAppContext();

	const [cartArray, setCartArray] = useState([]);
	const [addresses, setAddresses] = useState([]);
	const [showAddress, setShowAddress] = useState(false);
	const [selectedAddress, setSelectedAddress] = useState(null);
	const [paymentOption, setPaymentOption] = useState("cod");
	const [isPlacingOrder, setIsPlacingOrder] = useState(false);

	const getCart = () => {
		let tempArray = [];
		for (const key in cartItems) {
			const product = products.find(
				(item) => item._id === key || item.upc === key,
			);
			if (product) {
				product.quantity = cartItems[key];
				tempArray.push(product);
			}
		}
		setCartArray(tempArray);
	};

	const getUserAddress = async () => {
		try {
			const { data } = await axios.get("/api/address/get-addresses", {});

			if (data.success && Array.isArray(data.addresses)) {
				if (data.addresses.length > 0) {
					setAddresses(data.addresses);
					setSelectedAddress(data.addresses[0]);
				} else {
					setAddresses([]);
					setSelectedAddress(null);
				}
			} else {
				setAddresses([]);
				setSelectedAddress(null);
				if (data.message) {
					toast.error(data.message);
				}
			}
		} catch (error) {
			console.error("Error fetching addresses:", error.message);
			setAddresses([]);
			setSelectedAddress(null);
		}
	};

	const handleAddNewAddress = () => {
		setShowAddress(false);
		navigate("/add-address");
		window.scrollTo(0, 0);
	};

	const placeOrder = async () => {
		try {
			if (!user || !user.id) {
				console.error("User not authenticated");
				toast.error("Please log in to place an order");
				navigate("/login");
				return;
			}

			if (!selectedAddress || !selectedAddress._id) {
				return toast.error("Please add and select a delivery address");
			}

			if (cartArray.length === 0) {
				return toast.error("Your cart is empty");
			}

			setIsPlacingOrder(true);

			console.log("═══════════════════════════════════");
			console.log("Placing order...");
			console.log("User ID:", user.id);
			console.log("Items:", cartArray.length);
			console.log("Address:", selectedAddress._id);

			const orderData = {
				userId: user.id,
				items: cartArray.map((item) => {
					const isExternalProduct = item.isMealDbProduct || item.isKrogerProduct || !item._id;
					const productId = item._id || item.upc || item.productId;
					const productSource = isExternalProduct ? "themealdb" : "local";

					return {
						productId: productId,
						productSource: productSource,
						quantity: item.quantity,
						upc: item.upc || null,
					};
				}),
				address: selectedAddress._id,
			};

			console.log("Order data:", orderData);

			if (paymentOption === "cod" || paymentOption === "cash") {
				const { data } = await axios.post("/api/order/cod", orderData);

				console.log("Order response:", data);

				if (data.success) {
					toast.success(data.message || "Order placed successfully!");
					setCartItems({});

					console.log("Navigating to /my-orders");
					navigate("/my-orders");
				} else {
					toast.error(data.message || "Failed to place order");
				}
			} else if (paymentOption === "Credit/Debit") {
				const { data } = await axios.post(
					"/api/order/payment",
					orderData,
				);

				if (data.success) {
					window.location.replace(data.url);
				} else {
					toast.error(data.message || "Payment initiation failed");
				}
			}
		} catch (error) {
			console.error("Order placement error:", error);
			toast.error(error.message || "Failed to place order");
		} finally {
			setIsPlacingOrder(false);
			console.log("═══════════════════════════════════\n");
		}
	};

	useEffect(() => {
		if (products.length > 0 && cartItems) {
			getCart();
		}
	}, [products, cartItems]);

	useEffect(() => {
		if (user) {
			getUserAddress();
		}
	}, [user]);

	console.log("Current user:", user);
	console.log("Selected address in cart:", selectedAddress);

	if (products.length === 0 || Object.keys(cartItems).length === 0) {
		return (
			<div className="text-center mt-20 mb-20">
				<p className="text-primary-forest-green text-xl">
					your cart is empty
				</p>
				<button
					onClick={() => navigate("/products")}
					className="mt-4 text-secondary-golden-honey hover:underline"
				>
					continue shopping
				</button>
			</div>
		);
	}

	return products.length > 0 && cartItems ? (
		<div className="flex flex-col md:flex-row py-16 mt-16 ">
			<div className="flex-1 max-w-4xl">
				{" "}
				<h1 className="text-3xl font-medium mb-6 text-primary-forest-green">
					shopping{" "}
					<span className="text-3xl font-medium mb-6 text-secondary-golden-honey">
						cart{" "}
					</span>{" "}
					<span className="text-sm text-primary-forest-green">
						{" - "}
						{getCartCount()} items{" "}
					</span>
				</h1>
				<div className="grid grid-cols-[4fr_2fr_2fr] text-primary-forest-green/70 text-base font-medium pb-3">
					<p className="text-left">product details</p>
					<p className="text-center">subtotal</p>
					<p className="text-center">action</p>
				</div>
				{cartArray.map((product, index) => (
					<div
						key={index}
						className="grid grid-cols-[4fr_2fr_2fr] text-primary-forest-green items-center text-sm md:text-base font-medium pt-3"
					>
						<div className="flex items-center md:gap-6 gap-3">
							<div
								onClick={() => {
									navigate(
										`/products/${product.category}/${
											product._id || product.upc
										}`,
									);
									scrollTo(0, 0);
								}}
								className="cursor-pointer w-24 h-24 flex items-center justify-center border border-secondary-golden-honey rounded"
							>
								<img
									className="max-w-full h-full object-cover"
									src={product.image[0]}
									alt={product.name}
								/>
							</div>
							<div>
								<p className="hidden md:block font-semibold">
									{product.brand}
								</p>
								<p className="hidden md:block font-semibold">
									{product.description}
								</p>
								<div className="font-normal text-primary-forest-green/70">
									<div className="flex items-center">
										<p className="text-primary-forest-green/70">
											qty:{" "}
										</p>
										<select
											onChange={(e) =>
												updateCartItems(
													product._id || product.upc,
													Number(e.target.value),
												)
											}
											value={
												cartItems[
													product._id || product.upc
												]
											}
											className="outline-none"
										>
											{Array(
												cartItems[
													product._id || product.upc
												] > 9
													? cartItems[
															product._id ||
																product.upc
														]
													: 9,
											)
												.fill("")
												.map((_, index) => (
													<option
														key={index}
														value={index + 1}
													>
														{index + 1}
													</option>
												))}
										</select>
									</div>
								</div>
							</div>
						</div>
						<p className="text-center">
							{currency}
							{(product.offerPrice * product.quantity).toFixed(2)}
						</p>
						<button
							onClick={() =>
								removeFromCart(product._id || product.upc)
							}
							className="cursor-pointer mx-auto"
						>
							<img
								className="inline-block w-6 h-6"
								src={assets.removeIcon}
								alt="remove"
							/>
						</button>
					</div>
				))}
				<button
					onClick={() => {
						navigate("/products");
						scrollTo(0, 0);
					}}
					className="group cursor-pointer flex items-center mt-8 gap-2 text-primary-forest-green font-medium"
				>
					continue shopping
					<img
						className="group-hover:-translate-x-2 transition"
						src={assets.rightArrowGreen}
						alt="arrow right"
					/>
				</button>
			</div>

			<div className="max-w-[360px] w-full bg-primary-sage-green/40 p-5 max-md:mt-16 border border-primary-sage-green/70 h-fit">
				<h2 className="text-xl md:text-xl font-medium">
					order summary
				</h2>
				<hr className="border-primary-sage-green my-5" />

				<div className="mb-6">
					<p className="text-sm font-medium">delivery address</p>
					<div className="relative flex justify-between items-start mt-2">
						<p className="text-primary-forest-green/70 whitespace-pre-wrap text-xs">
							{selectedAddress
								? `${selectedAddress.firstName} ${selectedAddress.lastName}, 
								${selectedAddress.streetLine1}${
									selectedAddress.streetLine2
										? ", " + selectedAddress.streetLine2
										: ""
								},
									${selectedAddress.city},
									${selectedAddress.state} ${selectedAddress.zipCode}
									`
								: "no address found"}
						</p>
						<button
							onClick={() => setShowAddress(!showAddress)}
							className="text-primary-forest-green hover:underline cursor-pointer whitespace-nowrap ml-4"
						>
							change
						</button>
						{showAddress && (
							<div className="absolute top-12 py-1 bg-primary-cream border border-primary-forest-green text-sm w-full md:w-56 z-50 shadow-lg max-h-48">
								{addresses.map((address, index) => (
									<p
										key={index}
										onClick={() => {
											setSelectedAddress(address);
											setShowAddress(false);
										}}
										className="text-primary-sage-green p-2 hover:bg-primary-forest-green cursor-pointer"
									>
										{address.firstName} {address.lastName}
										<br />
										{address.streetLine1}
										{address.streetLine2 &&
											`, ${address.streetLine2}`}
										<br />
										{address.city}, {address.state}{" "}
										{address.zipCode}
									</p>
								))}
								<button
									type="button"
									onClick={() => {
										handleAddNewAddress();
									}}
									className="text-primary-forest-green text-center cursor-pointer p-2 hover:bg-primary-forest-green/10 w-full"
								>
									add new address
								</button>
							</div>
						)}
					</div>

					<p className="text-sm font-medium mt-6">payment method</p>

					<select
						onChange={(e) => setPaymentOption(e.target.value)}
						className="w-full border border-primary-forest-green bg-primary-cream px-3 py-2 mt-2 outline-none"
					>
						<option value="cash">cash</option>
						{/* <option value="Credit/Debit">credit/debit</option> */}
					</select>
				</div>

				<hr className="border-primary-forest-green" />

				<div className="text-primary-forest-green mt-4 space-y-2">
					<p className="flex justify-between">
						<span>price:</span>
						<span>
							{currency}
							{getCartAmount().toFixed(2)}
						</span>
					</p>
					<p className="flex justify-between text-primary-forest-green">
						<span>shipping:</span>
						<span className="text-secondary-golden-honey">
							free
						</span>
					</p>
					<p className="flex justify-between">
						<span>tax (7.85%):</span>
						<span>
							{currency}
							{((getCartAmount() * 7.85) / 100).toFixed(2)}
						</span>
					</p>
					<p className="flex justify-between text-lg font-medium mt-3">
						<span>total amount:</span>
						<span>
							{currency}
							{(
								getCartAmount() +
								(getCartAmount() * 7.85) / 100
							).toFixed(2)}
						</span>
					</p>
				</div>

				<button
					onClick={placeOrder}
					disabled={!selectedAddress || isPlacingOrder || !user}
					title={
						!user
							? "please log in to place order"
							: !selectedAddress
								? "please add an address"
								: ""
					}
					className="w-full py-3 mt-6 cursor-pointer bg-primary-sage-green hover:bg-primary-forest-green text-primary-cream font-medium transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-sage-green"
				>
					{isPlacingOrder ? "placing order..." : "place order"}
				</button>
			</div>
		</div>
	) : null;
};

export default Cart;
