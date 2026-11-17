import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import ThemeToggle from "./ThemeToggle";

const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

const Navbar = () => {
	const clerk = clerkEnabled ? useClerk() : null;
	const [open, setOpen] = useState(false);

	const {
		navigate,
		user,
		setUser,
		setIsAdmin,
		setShowUserLogin,
		setSearchQuery,
		searchQuery,
		getCartCount,
		isAdmin,
	} = useAppContext();

	const logout = async () => {
		try {
			if (clerk?.signOut) await clerk.signOut();
			setUser(null);
			setIsAdmin(false);
			setShowUserLogin(false);
			toast.success("Logged out successfully");
			navigate("/");
		} catch (error) {
			toast.error(error.message || "Logout failed");
		}
	};

	useEffect(() => {
		if (searchQuery.length > 0) {
			navigate("/products");
		}
	}, [searchQuery, navigate]);

	return (
		<nav className="flex items-center justify-between px-4 sm:px-8 lg:px-16 xl:px-24 py-4 border-b border-primary-forest-green bg-secondary-soft-beige text-primary-forest-green transition-all">
			<NavLink onClick={() => setOpen(false)} to={"/"}>
				<img className="h-10" src={assets.holisticAfLogoNoBg} alt="holisticAF logo" />
			</NavLink>

			<div className="hidden sm:flex items-center gap-6 lg:gap-8">
				<div className="hidden lg:flex items-center text-sm gap-2 border border-secondary-deep-forest px-3 rounded-full bg-primary-warm-white">
					<input
						onChange={(e) => setSearchQuery(e.target.value)}
						className="py-1.5 w-full bg-transparent outline-none placeholder-primary-forest-green"
						type="text"
						placeholder="search products"
					/>
					<img src={assets.search} alt="search" className="w-4 h-4 text-secondary-deep-forest" />
				</div>

				<NavLink to={"/"}>home</NavLink>
				<NavLink to={"/products"}>products</NavLink>
				<NavLink to={"/contact"}>contact</NavLink>

				{(isAdmin || !clerkEnabled) && (
					<button
						onClick={() => navigate("/admin")}
						className="text-xs border border-primary-forest-green px-2 py-1 hover:bg-primary-forest-green hover:text-primary-warm-white rounded-full transition"
					>
						admin
					</button>
				)}

				<ThemeToggle />

				<div onClick={() => navigate("/cart")} className="relative cursor-pointer">
					<img src={assets.cart} alt="cart" className="w-6 opacity-80 text-primary-sage-green" />
					<button className="absolute -top-2 -right-3 text-xs text-primary-cream bg-primary-sage-green w-[18px] h-[18px] rounded-full">
						{getCartCount()}
					</button>
				</div>

				{!clerkEnabled ? (
					<span className="text-[10px] px-2 py-1 rounded-full border border-primary-forest-green/20 text-primary-forest-green/60 uppercase tracking-wider">
						local preview
					</span>
				) : !user ? (
					<button
						onClick={() => setShowUserLogin(true)}
						className="cursor-pointer px-8 py-2 bg-secondary-golden-honey text-neutral-charcoal border border-primary-forest-green hover:opacity-90 transition rounded-full"
					>
						login
					</button>
				) : (
					<div className="flex items-center gap-3">
						<UserButton afterSignOutUrl="/" />
						<div className="relative group">
							<img src={assets.profile} className="w-10 cursor-pointer outline-secondary-soft-beige" alt="profile" />
							<ul className="hidden group-hover:block absolute top-10 right-0 bg-secondary-soft-beige shadow border border-primary-forest-green py-2.5 w-36 rounded-md text-sm z-40">
								<li onClick={() => navigate("/my-orders")} className="p-1.5 pl-3 hover:bg-primary-sage-green/20 cursor-pointer">
									my orders
								</li>
								{isAdmin && (
									<li onClick={() => navigate("/admin")} className="p-1.5 pl-3 hover:bg-primary-sage-green/20 cursor-pointer">
										admin
									</li>
								)}
								<li onClick={logout} className="p-1.5 pl-3 hover:bg-primary-sage-green/20 cursor-pointer">
									logout
								</li>
							</ul>
						</div>
					</div>
				)}
			</div>

			<div className="flex items-center gap-4 sm:hidden">
				<ThemeToggle />
				<div onClick={() => navigate("/cart")} className="relative cursor-pointer">
					<img src={assets.cart} alt="cart" className="w-6 opacity-80" />
					<button className="absolute -top-2 -right-3 text-xs text-secondary-deep-forest bg-primary-sage-green w-[18px] h-[18px] rounded-full">
						{getCartCount()}
					</button>
				</div>
				<button onClick={() => setOpen((v) => !v)} aria-label="Menu" className="bg-transparent border-none cursor-pointer p-0">
					<img src={assets.menuGreen} alt="menu" />
				</button>
			</div>

			{open && (
				<div className="flex sm:hidden fixed inset-0 top-[60px] bg-secondary-soft-beige shadow-md py-8 flex-col items-center gap-3 px-5 text-2xl z-50 min-h-screen overflow-y-auto">
					<NavLink to={"/"} onClick={() => setOpen(false)}>home</NavLink>
					<NavLink to={"/products"} onClick={() => setOpen(false)}>products</NavLink>
					<NavLink to={"/contact"} onClick={() => setOpen(false)}>contact</NavLink>
					{user && <NavLink to={"/my-orders"} onClick={() => setOpen(false)}>my orders</NavLink>}
					{(isAdmin || !clerkEnabled) && <NavLink to={"/admin"} onClick={() => setOpen(false)}>admin</NavLink>}

					{!clerkEnabled ? null : !user ? (
						<button
							onClick={() => {
								setOpen(false);
								setShowUserLogin(true);
							}}
							className="cursor-pointer px-6 py-2 mt-8 bg-primary-forest-green text-primary-warm-white rounded-full text-lg border-none"
						>
							login
						</button>
					) : (
						<button
							onClick={() => {
								setOpen(false);
								logout();
							}}
							className="cursor-pointer px-6 py-2 mt-4 bg-primary-forest-green text-primary-warm-white rounded-full text-base border-none"
						>
							logout
						</button>
					)}
				</div>
			)}
		</nav>
	);
};

export default Navbar;
