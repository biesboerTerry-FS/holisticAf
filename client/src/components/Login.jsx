import React, { useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const demoEmail = import.meta.env.VITE_DEMO_USER_EMAIL;
const demoPassword = import.meta.env.VITE_DEMO_USER_PASSWORD;

const Login = () => {
	const { setShowUserLogin, setUser, setIsAdmin, axios } = useAppContext();
	const [state, setState] = useState("login");
	const [demoLoading, setDemoLoading] = useState(false);

	const demoLogin = async () => {
		if (!demoEmail || !demoPassword) {
			toast.error("Demo credentials are not configured");
			return;
		}
		try {
			setDemoLoading(true);
			const { data } = await axios.post("/api/user/demo-login");
			if (data.success) {
				setUser({ ...data.user, clerkId: "demo_user" });
				setIsAdmin(data.user.role === "admin");
				setShowUserLogin(false);
				toast.success(`Welcome, ${data.user.name || "demo user"}!`);
			} else {
				toast.error(data.message || "Demo login failed");
			}
		} catch (error) {
			console.error("Demo login error:", error);
			toast.error("Demo login failed. Is the backend running?");
		} finally {
			setDemoLoading(false);
		}
	};

	return (
		<div
			onClick={() => setShowUserLogin(false)}
			className="fixed inset-0 z-50 flex items-center bg-secondary-golden-honey/30 backdrop-blur-xl overflow-y-auto p-4"
		>
			<div onClick={(event) => event.stopPropagation()} className="m-auto flex flex-col items-center gap-4">
				{!clerkEnabled ? (
					<div className="max-w-md rounded-2xl border border-primary-forest-green/15 bg-primary-cream p-6 text-center text-primary-forest-green shadow-lg">
						<p className="text-lg font-semibold">Welcome to holisticAF</p>
						<p className="mt-2 text-sm text-primary-forest-green/75">
							Authentication is running in demo mode for local development.
						</p>
						<div className="mt-4 flex flex-col gap-2">
							<button
								onClick={demoLogin}
								disabled={demoLoading}
								className="w-full rounded-full bg-secondary-golden-honey px-4 py-2 text-sm font-semibold text-neutral-charcoal transition hover:opacity-90 disabled:opacity-60"
							>
								{demoLoading ? "Signing in..." : "Try demo login"}
							</button>
							<button
								onClick={() => setShowUserLogin(false)}
								className="w-full rounded-full border border-primary-forest-green/30 px-4 py-2 text-sm text-primary-forest-green transition hover:bg-primary-forest-green/5"
							>
								Continue browsing
							</button>
						</div>
						<p className="mt-3 text-xs text-primary-forest-green/50">
							Clerk can be enabled by setting{" "}
							<code className="rounded bg-secondary-soft-beige px-1 py-0.5">VITE_CLERK_PUBLISHABLE_KEY</code>{" "}
							in <code className="rounded bg-secondary-soft-beige px-1 py-0.5">client/.env</code>.
						</p>
					</div>
				) : state === "login" ? (
					<div className="flex flex-col items-center gap-4">
						<SignIn
							routing="hash"
							appearance={{
								variables: {
									colorPrimary: "#1E4D43",
									colorText: "#1E4D43",
									colorBackground: "#F5F3EE",
									colorInputBackground: "#ffffff",
									borderRadius: "0.5rem",
								},
								elements: {
									formButtonPrimary:
										"bg-primary-forest-green hover:bg-primary-sage-green text-sm normal-case",
									card: "bg-primary-sage-green/30 border border-primary-forest-green shadow-none",
								},
							}}
						/>
						<p className="rounded-full bg-primary-forest-green/60 px-4 py-2 text-primary-warm-white shadow-md">
							don&apos;t have an account?{" "}
							<button
								onClick={() => setState("register")}
								className="cursor-pointer font-bold text-secondary-golden-honey hover:underline"
							>
								sign up
							</button>
						</p>
					</div>
				) : (
					<div className="flex flex-col items-center gap-4">
						<SignUp
							routing="hash"
							signInUrl="#"
							appearance={{
								variables: {
									colorPrimary: "#1E4D43",
									colorText: "#1E4D43",
									colorBackground: "#F5F3EE",
									colorInputBackground: "#ffffff",
									borderRadius: "0.5rem",
								},
								elements: {
									formButtonPrimary:
										"bg-primary-forest-green hover:bg-primary-sage-green text-sm normal-case",
									card: "bg-primary-cream border border-primary-forest-green shadow-none",
								},
							}}
						/>
						<p className="rounded-full bg-primary-forest-green/60 px-4 py-2 text-primary-warm-white shadow-md">
							already have an account?{" "}
							<button
								onClick={() => setState("login")}
								className="cursor-pointer font-bold text-secondary-golden-honey hover:underline"
							>
								login
							</button>
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Login;
