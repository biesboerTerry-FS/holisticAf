import React from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes, useLocation } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import ProductCategory from "./pages/ProductCategory";
import Cart from "./pages/Cart";
import AddAddress from "./pages/AddAddress";
import AddInventory from "./pages/admin/AddInventory";
import MyOrders from "./pages/MyOrders";
import AdminLayout from "./pages/admin/AdminLayout";
import Inventory from "./pages/admin/Inventory";
import Orders from "./pages/admin/Orders";
import Dashboard from "./pages/admin/Dashboard";
import Schedule from "./pages/admin/Schedule";
import Contact from "./pages/Contact";
import Featured from "./pages/Featured";

const App = () => {
	const isAdminPath = useLocation().pathname.includes("admin");
	const { showUserLogin, isAdmin } = useAppContext();

	return (
		<div className="text-default flex flex-col min-h-screen bg-secondary-soft-beige">
			{isAdminPath ? null : <Navbar />}
			{showUserLogin ? <Login /> : null}
			<Toaster />

			<div
				className={`${
					isAdminPath ? "" : "px-4 sm:px-8 lg:px-16 xl:px-24 flex-1"
				}`}
			>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/products" element={<Products />} />
					<Route
						path="/products/:category"
						element={<ProductCategory />}
					/>
					<Route
						path="/products/:category/:id"
						element={<ProductDetails />}
					/>
					<Route path="/top-sellers" element={<Featured />} />
					<Route path="/cart" element={<Cart />} />
					<Route path="/add-address" element={<AddAddress />} />
					<Route path="/my-orders" element={<MyOrders />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/login" element={<Login />} />

					{/* //^ Admin routes (auth disabled for now) */}
					<Route
						path="/admin"
						element={<AdminLayout />}
					>
						<Route index element={<Dashboard />} />
						<Route path="schedule" element={<Schedule />} />
						<Route
							path="add-inventory"
							element={<AddInventory />}
						/>
						<Route path="inventory" element={<Inventory />} />
						<Route path="orders" element={<Orders />} />
					</Route>
				</Routes>
			</div>
			{!isAdminPath && <Footer />}
		</div>
	);
};

export default App;
