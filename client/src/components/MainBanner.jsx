import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const MainBanner = () => {
	return (
		<div className="relative rounded-3xl overflow-hidden border border-primary-forest-green/20 shadow-2xl">
			<img
				src={assets.mainBannerBg}
				alt="banner"
				className="w-full h-auto hidden md:block"
			/>
			<img
				src={assets.mainBannerBgSmall}
				alt="banner"
				className="w-full h-auto md:hidden"
			/>

			<div className="absolute inset-0 bg-gradient-to-r from-primary-forest-green/90 via-primary-forest-green/60 to-transparent" />
			<div className="absolute inset-0 bg-dot-pattern opacity-40" />

			<div className="absolute inset-0 flex flex-col items-center md:items-start justify-end md:justify-center pb-20 md:pb-0 px-6 md:pl-18 lg:pl-24">
				<span className="mb-4 inline-flex items-center px-4 py-1.5 rounded-full bg-secondary-golden-honey text-neutral-charcoal text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg">
					🌿 100% holistic goodness
				</span>

				<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left max-w-80 md:max-w-96 lg:max-w-[28rem] leading-tight lg:leading-[1.15] text-primary-warm-white drop-shadow-lg">
					nourish with purpose —{" "}
					<span className="text-secondary-golden-honey italic">
						your food is your medicine.
					</span>
				</h1>

				<div className="flex items-center mt-8 font-medium gap-4">
					<Link
						to={"/products"}
						className="group flex items-center gap-2 px-7 md:px-9 py-3.5 bg-secondary-golden-honey hover:bg-secondary-golden-honey/90 transition rounded-full text-neutral-charcoal shadow-lg hover:shadow-xl hover:-translate-y-0.5"
					>
						shop now
						<img
							className="w-4 h-4 transition-transform group-hover:translate-x-1"
							src={assets.rightArrowBeige}
							alt="arrow"
						/>
					</Link>
					<Link
						to={"/top-sellers"}
						className="group hidden md:flex items-center gap-2 px-9 py-3.5 cursor-pointer text-primary-warm-white hover:text-secondary-golden-honey transition"
					>
						see top sellers
						<img
							className="w-4 h-4 transition-transform group-hover:translate-x-1"
							src={assets.rightArrowBeige}
							alt="arrow"
						/>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default MainBanner;
