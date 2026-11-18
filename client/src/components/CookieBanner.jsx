import React, { useEffect, useState } from "react";

const STORAGE_KEY = "holisticAF_cookie_consent";

const defaultConsent = {
	essential: true,
	analytics: false,
	marketing: false,
};

const CookieBanner = () => {
	const [show, setShow] = useState(false);
	const [customize, setCustomize] = useState(false);
	const [consent, setConsent] = useState(defaultConsent);

	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) {
				setShow(true);
			} else {
				setConsent(JSON.parse(stored));
			}
		} catch {
			setShow(true);
		}
	}, []);

	const saveConsent = (nextConsent) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConsent));
		} catch {
			// ignore storage errors
		}
		setConsent(nextConsent);
		setShow(false);
		setCustomize(false);
	};

	const acceptAll = () =>
		saveConsent({ essential: true, analytics: true, marketing: true });

	const rejectNonEssential = () =>
		saveConsent({ essential: true, analytics: false, marketing: false });

	const togglePreference = (key) => {
		setConsent((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	if (!show) return null;

	return (
		<div className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6">
			<div className="relative mx-auto max-w-5xl rounded-3xl bg-primary-warm-white/95 backdrop-blur border border-secondary-golden-honey/30 shadow-2xl overflow-hidden">
				<div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />

				<div className="relative p-5 sm:p-7">
					<button
						onClick={rejectNonEssential}
						className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-primary-forest-green/60 hover:bg-primary-sage-green/20 hover:text-primary-forest-green transition"
						aria-label="Close cookie banner"
					>
						×
					</button>

					<div className="flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-8">
						<div className="flex-1">
							<h3 className="text-xl sm:text-2xl font-bold text-primary-forest-green">
								cookie preferences
							</h3>
							<p className="text-sm text-primary-forest-green/70 mt-2 leading-relaxed max-w-xl">
								We use cookies to make your holisticAF experience
								fresh and personalized. Essential cookies are always
								on; choose whether to enable analytics and marketing
								cookies.
							</p>
						</div>

						<div className="flex flex-col gap-3">
							{customize && (
								<div className="mb-1 p-4 rounded-2xl bg-secondary-soft-beige border border-primary-forest-green/10 space-y-3">
									{[
										{ key: "essential", label: "Essential", locked: true },
										{ key: "analytics", label: "Analytics" },
										{ key: "marketing", label: "Marketing" },
									].map(({ key, label, locked }) => (
										<label
											key={key}
											className="flex items-center justify-between gap-4 cursor-pointer"
										>
											<span className="text-sm font-medium text-primary-forest-green">
												{label}
												{locked && (
													<span className="ml-2 text-[10px] uppercase tracking-wide text-secondary-golden-honey">
														required
													</span>
												)}
											</span>
											<button
												type="button"
												disabled={locked}
												onClick={() => !locked && togglePreference(key)}
												className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
													consent[key]
														? "bg-secondary-golden-honey"
														: "bg-primary-sage-green/30"
												} ${locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
											>
												<span
													className={`inline-block h-4 w-4 transform rounded-full bg-primary-warm-white shadow transition ${
														consent[key]
															? "translate-x-6"
															: "translate-x-1"
													}`}
												/>
											</button>
										</label>
									))}
								</div>
							)}

							<div className="flex flex-wrap items-center gap-3">
								<button
									onClick={acceptAll}
									className="px-6 py-2.5 rounded-full bg-secondary-golden-honey text-neutral-charcoal text-sm font-bold shadow hover:shadow-md hover:-translate-y-0.5 transition"
								>
									Accept All
								</button>
								<button
									onClick={rejectNonEssential}
									className="px-6 py-2.5 rounded-full bg-primary-forest-green text-primary-warm-white text-sm font-bold shadow hover:shadow-md hover:-translate-y-0.5 transition"
								>
									Reject Non-Essential
								</button>
								<button
									onClick={() =>
										setCustomize((prev) => {
											if (prev) saveConsent(consent);
											return !prev;
										})
									}
									className="px-6 py-2.5 rounded-full border border-primary-forest-green/20 text-primary-forest-green text-sm font-semibold hover:bg-primary-sage-green/10 transition"
								>
									{customize ? "Save Preferences" : "Customize"}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CookieBanner;
