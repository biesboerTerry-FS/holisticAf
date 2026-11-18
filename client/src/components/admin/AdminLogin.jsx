import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const demoAdminEmail = import.meta.env.VITE_DEMO_ADMIN_EMAIL;
const demoAdminPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD;
const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

const AdminLogin = () => {
	const { isAdmin, setIsAdmin, navigate } = useAppContext();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const adminLoginRequest = async (loginEmail, loginPassword) => {
		const response = await fetch(`${backendUrl}/api/admin/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ email: loginEmail, password: loginPassword }),
		});
		return response.json();
	};

	const onSubmitHandler = async (event) => {
		try {
			event.preventDefault();
			setLoading(true);
			const data = await adminLoginRequest(email, password);
			if (data.success) {
				setIsAdmin(true);
				navigate("/admin");
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	const demoAdminLogin = async () => {
		if (!demoAdminEmail || !demoAdminPassword) {
			toast.error("Demo admin credentials are not configured");
			return;
		}
		try {
			setLoading(true);
			const data = await adminLoginRequest(demoAdminEmail, demoAdminPassword);
			if (data.success) {
				setIsAdmin(true);
				navigate("/admin");
				toast.success("Logged in as demo admin");
			} else {
				toast.error(data.message || "Demo admin login failed");
			}
		} catch (error) {
			console.error("Demo admin login error:", error);
			toast.error("Demo admin login failed. Is the backend running?");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isAdmin) {
			navigate("/admin");
		}
	}, [isAdmin, navigate]);

	return (
		!isAdmin && (
			<form
				onSubmit={onSubmitHandler}
				className="min-h-screen flex items-center justify-center bg-secondary-soft-beige px-4 text-sm text-primary-forest-green"
			>
				<div className="flex flex-col gap-5 w-full max-w-sm items-start p-8 rounded-lg shadow-xl border border-primary-forest-green/30 bg-primary-warm-white">
					<p className="text-3xl font-bold text-secondary-golden-honey">
						holisticAF
					</p>
					<p className="text-2xl font-medium">
						admin{" "}
						<span className="text-secondary-golden-honey">
							login
						</span>
					</p>
					<div className="w-full">
						<label
							htmlFor="admin-email"
							className="text-primary-forest-green"
						>
							email
						</label>
						<input
							id="admin-email"
							onChange={(event) => setEmail(event.target.value)}
							value={email}
							placeholder="you@example.com"
							className="border border-primary-forest-green/40 outline-primary-sage-green bg-primary-cream rounded w-full p-2 mt-1 focus:border-primary-forest-green"
							type="email"
							autoComplete="username"
							required
						/>
					</div>
					<div className="w-full">
						<label
							htmlFor="admin-password"
							className="text-primary-forest-green"
						>
							password
						</label>
						<input
							id="admin-password"
							onChange={(event) =>
								setPassword(event.target.value)
							}
							value={password}
							placeholder="enter your password"
							className="border border-primary-forest-green/40 outline-primary-sage-green bg-primary-cream rounded w-full p-2 mt-1 focus:border-primary-forest-green"
							type="password"
							autoComplete="current-password"
							required
						/>
					</div>
					<button
						disabled={loading}
						className="bg-primary-forest-green text-primary-cream w-full py-2 rounded-md cursor-pointer transition hover:bg-secondary-deep-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-golden-honey disabled:opacity-60"
					>
						{loading ? "Signing in..." : "login"}
					</button>

					<div className="w-full flex items-center gap-3">
						<span className="h-px flex-1 bg-primary-forest-green/15" />
						<span className="text-xs text-primary-forest-green/50">or</span>
						<span className="h-px flex-1 bg-primary-forest-green/15" />
					</div>

					<button
						type="button"
						onClick={demoAdminLogin}
						disabled={loading}
						className="w-full rounded-md border border-secondary-golden-honey bg-secondary-golden-honey/10 px-4 py-2 text-sm font-semibold text-neutral-charcoal transition hover:bg-secondary-golden-honey/20 disabled:opacity-60"
					>
						{loading ? "Signing in..." : "Try demo admin login"}
					</button>
				</div>
			</form>
		)
	);
};

export default AdminLogin;
