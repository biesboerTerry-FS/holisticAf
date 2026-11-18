import React, { createContext, useContext, useMemo, useState } from "react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
	const [cart, setCart] = useState({});

	const addToCart = (product) => {
		const id = product?._id || product?.externalId || product?.productId || product?.name;
		if (!id) return;
		setCart((prev) => ({
			...prev,
			[id]: { product, quantity: (prev[id]?.quantity || 0) + 1 },
		}));
	};

	const updateQuantity = (id, delta) => {
		setCart((prev) => {
			const current = prev[id];
			if (!current) return prev;
			const nextQty = current.quantity + delta;
			if (nextQty <= 0) {
				const copy = { ...prev };
				delete copy[id];
				return copy;
			}
			return { ...prev, [id]: { ...current, quantity: nextQty } };
		});
	};

	const removeFromCart = (id) => {
		setCart((prev) => {
			const copy = { ...prev };
			delete copy[id];
			return copy;
		});
	};

	const cartCount = useMemo(
		() => Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0),
		[cart],
	);

	const cartTotal = useMemo(
		() =>
			Object.values(cart).reduce((sum, item) => {
				const p = item.product || {};
				const price = p.offerPrice ?? p.price?.sale ?? p.regularPrice ?? p.price?.regular ?? 0;
				return sum + Number(price) * (item.quantity || 0);
			}, 0),
		[cart],
	);

	const value = {
		cart,
		addToCart,
		updateQuantity,
		removeFromCart,
		cartCount,
		cartTotal,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
