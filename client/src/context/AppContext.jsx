import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

const useAppState = () => {
	const currency = import.meta.env.VITE_CURRENCY || "$";
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isAuthLoading, setIsAuthLoading] = useState(true);
	const [showUserLogin, setShowUserLogin] = useState(false);
	const [products, setProducts] = useState([]);
	const [cartItems, setCartItems] = useState({});
	const [searchQuery, setSearchQuery] = useState({});
	const [loading, setLoading] = useState(false);

	const fetchProducts = async (initialQuery = "") => {
		try {
			setLoading(true);
			// Prefer locally seeded holisticAF products for the storefront home/all-products view.
			const { data } = await axios.get("/api/inventory/inventory?source=local", {
				suppressGlobalErrorToast: true,
			});
			if (data.success) {
				setProducts(Array.isArray(data.products) ? data.products : []);
			} else {
				toast.error(data.message || "Failed to load products");
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to load products");
		} finally {
			setLoading(false);
		}
	};

	const searchProducts = async (query) => {
		try {
			setLoading(true);
			const trimmed = String(query || "").trim();
			if (!trimmed) {
				await fetchProducts();
				return;
			}
			const { data } = await axios.get("/api/kroger/search", {
				params: { query: trimmed, limit: 50 },
				suppressGlobalErrorToast: true,
			});
			if (data.success) {
				setProducts(Array.isArray(data.products) ? data.products : []);
				if (data.products.length === 0) {
					toast.error("No products found. Try a different search.");
				}
			} else {
				toast.error(data.message || "Search failed");
				setProducts([]);
			}
		} catch (error) {
			console.error("Search error:", error);
			toast.error("Search failed");
			setProducts([]);
		} finally {
			setLoading(false);
		}
	};

	const getProductsByCategory = async (category) => {
		try {
			setLoading(true);
			const { data } = await axios.get(`/api/kroger/category/${encodeURIComponent(category)}`, {
				params: { limit: 50 },
				suppressGlobalErrorToast: true,
			});
			if (data.success) {
				setProducts(Array.isArray(data.products) ? data.products : []);
			} else {
				toast.error("Failed to load category products");
			}
		} catch (error) {
			console.error("Category error:", error);
			toast.error("Failed to load products");
		} finally {
			setLoading(false);
		}
	};

	const addToCart = (itemId) => {
		let cartData = structuredClone(cartItems);
		cartData[itemId] = (cartData[itemId] || 0) + 1;
		setCartItems(cartData);
		toast.success("Added to cart.");
	};

	const updateCartItems = (itemId, quantity) => {
		let cartData = structuredClone(cartItems);
		cartData[itemId] = quantity;
		setCartItems(cartData);
		toast.success("Cart updated.");
	};

	const removeFromCart = (itemId) => {
		let cartData = structuredClone(cartItems);
		if (cartData[itemId]) {
			cartData[itemId] -= 1;
			if (cartData[itemId] === 0) delete cartData[itemId];
		}
		toast.success("Removed from cart.");
		setCartItems(cartData);
	};

	const getCartCount = () => {
		let totalCount = 0;
		for (const item in cartItems) totalCount += cartItems[item];
		return totalCount;
	};

	const getCartAmount = () => {
		let totalAmount = 0;
		for (const itemId in cartItems) {
			const product = products.find(
				(p) => p._id === itemId || p.productId === itemId || p.id === itemId || p.upc === itemId,
			);
			if (product && cartItems[itemId] > 0) {
				const price =
					product.offerPrice ||
					product.price?.sale ||
					product.regularPrice ||
					product.price?.regular ||
					product.price ||
					0;
				totalAmount += price * cartItems[itemId];
			}
		}
		return Math.round(totalAmount * 100) / 100;
	};

	// Products are fetched on-demand by page components (Products, ProductSearch, etc.)
	// so category/search filters are not overwritten by a global initial load.

	// Persist cart for logged-in app user
	useEffect(() => {
		const updateCart = async () => {
			try {
				const { data } = await axios.post("/api/cart/update", { cartItems });
				if (!data.success && data.message) toast.error(data.message);
			} catch (error) {
				console.error("Cart update error:", error.message);
			}
		};
		if (user) updateCart();
	}, [cartItems, user]);

	// Attach user identifier for backend compatibility
	useEffect(() => {
		const authInterceptor = axios.interceptors.request.use(
			(config) => {
				const identifier = user?.clerkId || user?.id;
				if (identifier) config.headers.clerkid = identifier;
				return config;
			},
			(error) => Promise.reject(error),
		);
		return () => axios.interceptors.request.eject(authInterceptor);
	}, [user]);

	return {
		addToCart,
		axios,
		navigate,
		user,
		setUser,
		isAdmin,
		setIsAdmin,
		isAuthLoading,
		setIsAuthLoading,
		showUserLogin,
		setShowUserLogin,
		products,
		setProducts,
		cartItems,
		setCartItems,
		currency,
		updateCartItems,
		removeFromCart,
		searchQuery,
		setSearchQuery,
		getCartAmount,
		getCartCount,
		fetchProducts,
		loading,
		searchProducts,
		getProductsByCategory,
	};
};

export const ClerkAppContextProvider = ({ children }) => {
	const state = useAppState();
	const { user: clerkUser, isSignedIn, isLoaded } = useUser();

	useEffect(() => {
		const handleSync = async () => {
			if (!isLoaded) return;

			if (isSignedIn && clerkUser?.id) {
				try {
					const { data } = await axios.post("/api/user/sync", {
						clerkId: clerkUser.id,
						email: clerkUser.primaryEmailAddress?.emailAddress || "",
						name: clerkUser.fullName || clerkUser.firstName || "User",
					});
					if (data.success) {
						state.setUser(data.user);
						state.setCartItems(data.user.cartItems || {});
						state.setIsAdmin(data.user.role === "admin");
						state.setShowUserLogin(false);
					}
				} catch (error) {
					console.error("Sync error:", error);
				} finally {
					state.setIsAuthLoading(false);
				}
			} else {
				state.setUser(null);
				state.setIsAdmin(false);
				state.setIsAuthLoading(false);
			}
		};

		handleSync();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoaded, isSignedIn, clerkUser?.id]);

	return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
};

export const LocalAppContextProvider = ({ children }) => {
	const state = useAppState();

	useEffect(() => {
		// No Clerk configured: start logged out; use demo login to try protected sections
		state.setUser(null);
		state.setIsAdmin(false);
		state.setIsAuthLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
