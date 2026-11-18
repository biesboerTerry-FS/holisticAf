import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, Navigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import ThemeToggle from "../../components/ThemeToggle";
import AdminLogin from "../../components/admin/AdminLogin";
import toast from "react-hot-toast";

const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

const AdminLayout = () => {
	const clerk = clerkEnabled ? useClerk() : null;
	const { navigate, isAdmin, isAuthLoading, setUser, setIsAdmin, axios } = useAppContext();
	const [checkingAdmin, setCheckingAdmin] = useState(!clerkEnabled);

	useEffect(() => {
		if (clerkEnabled || isAdmin) return;
		let mounted = true;
		const verify = async () => {
			try {
				const { data } = await axios.get("/api/admin/is-auth", { suppressGlobalErrorToast: true });
				if (mounted && data?.success) setIsAdmin(true);
			} catch {
				// not authenticated
			} finally {
				if (mounted) setCheckingAdmin(false);
			}
		};
		verify();
		return () => {
			mounted = false;
		};
	}, [clerkEnabled, isAdmin, setIsAdmin, axios]);

	const sidebarLinks = [
		{ name: "dashboard", path: "/admin", icon: assets.list },
		{ name: "schedule", path: "/admin/schedule", icon: assets.list },
		{ name: "employees", path: "/admin/employees", icon: assets.list },
		{ name: "managers", path: "/admin/managers", icon: assets.list },
		{ name: "lms", path: "/admin/lms", icon: assets.list },
		{ name: "add inventory", path: "/admin/add-inventory", icon: assets.addIcon },
		{ name: "inventory", path: "/admin/inventory", icon: assets.list },
		{ name: "orders", path: "/admin/orders", icon: assets.search },
	];

	const logout = async () => {
		try {
			if (clerk?.signOut) await clerk.signOut();
			setUser(null);
			setIsAdmin(false);
			toast.success("Logged out");
		} catch {
			// ignore
		} finally {
			navigate("/");
		}
	};

	if ((clerkEnabled && isAuthLoading) || checkingAdmin) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-secondary-soft-beige text-primary-forest-green">
				Verifying access...
			</div>
		);
	}

	if (clerkEnabled && !isAdmin) {
		return <Navigate to="/" replace />;
	}

	if (!clerkEnabled && !isAdmin) {
		return <AdminLogin />;
	}

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(157,191,175,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(224,160,48,0.10),transparent_30%)] bg-secondary-soft-beige text-primary-forest-green">
			<header className="sticky top-0 z-30 border-b border-primary-forest-green/10 bg-primary-warm-white/75 backdrop-blur-xl">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
					<Link to="/" className="group flex items-center gap-3">
						<div className="rounded-xl p-1.5 transition">
							<img className="h-8 w-auto" src={assets.holisticAfLogoNoBg} alt="holisticAF logo" />
						</div>
						<div className="leading-tight">
							<h1 className="text-sm font-semibold tracking-tight md:text-base">
								admin <span className="text-secondary-golden-honey">portal</span>
							</h1>
							<p className="text-xs text-primary-forest-green/55">Operations dashboard</p>
						</div>
					</Link>
					<div className="flex items-center gap-2 md:gap-3">
						<div className="hidden items-center rounded-full border border-primary-forest-green/10 bg-secondary-soft-beige/70 px-3 py-1.5 text-xs text-primary-forest-green/70 sm:flex">
							{clerkEnabled ? "Clerk enabled" : "Local dev mode"}
						</div>
						<ThemeToggle />
						<button
							onClick={logout}
							className="rounded-full border border-primary-forest-green/15 bg-primary-warm-white/70 px-3.5 py-1.5 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-sage-green/15 hover:shadow"
						>
							Logout
						</button>
					</div>
				</div>
			</header>

			<div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-7xl">
				<aside className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-64 shrink-0 border-r border-primary-forest-green/10 bg-primary-warm-white/45 p-4 backdrop-blur md:block">
					<nav className="flex flex-col gap-1.5">
						{sidebarLinks.map((item) => (
							<NavLink
								to={item.path}
								key={item.name}
								end={item.path === "/admin"}
								className={({ isActive }) =>
									`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
										isActive
											? "bg-primary-forest-green text-primary-cream shadow-sm"
											: "text-primary-forest-green/75 hover:bg-primary-sage-green/15 hover:text-primary-forest-green"
									}`
								}
							>
								{({ isActive }) => (
									<>
										<span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${isActive ? "border-primary-cream/20 bg-primary-cream/10" : "border-primary-forest-green/10 bg-secondary-soft-beige/70"}`}>
											<img className={`h-4 w-4 ${isActive ? "brightness-0 invert" : "opacity-75"}`} src={item.icon} alt="" />
										</span>
										<span className="capitalize font-medium">{item.name}</span>
									</>
								)}
							</NavLink>
						))}
					</nav>
					<div className="mt-6 rounded-2xl border border-primary-forest-green/10 bg-gradient-to-br from-primary-sage-green/15 to-secondary-golden-honey/10 p-4 text-xs text-primary-forest-green/70 shadow-sm">
						<p className="font-semibold text-primary-forest-green">Admin tips</p>
						<ul className="mt-2 space-y-1.5">
							<li>• Monitor pending orders daily</li>
							<li>• Keep employee schedules current</li>
							<li>• Use dark mode for low-light work</li>
						</ul>
					</div>
				</aside>

				<div className="min-w-0 flex-1">
					<div className="border-b border-primary-forest-green/10 bg-primary-warm-white/40 px-2 py-2 backdrop-blur md:hidden">
						<nav className="flex gap-2 overflow-x-auto px-2 pb-1">
							{sidebarLinks.map((item) => (
								<NavLink
									to={item.path}
									key={item.name}
									end={item.path === "/admin"}
									className={({ isActive }) =>
										`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
											isActive
												? "bg-primary-forest-green text-primary-cream"
												: "border border-primary-forest-green/10 bg-primary-warm-white/70 text-primary-forest-green/75"
										}`
									}
								>
									{item.name}
								</NavLink>
							))}
						</nav>
					</div>
					<main className="min-w-0">
						<Outlet />
					</main>
				</div>
			</div>
		</div>
	);
};

export default AdminLayout;
