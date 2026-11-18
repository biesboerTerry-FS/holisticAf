import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "axios";
import toast from "react-hot-toast";

const TopSellers = () => {
	const [featuredProducts, setFeaturedProducts] = useState([]);

	useEffect(() => {
		const fetchFeatured = async () => {
			try {
				const { data } = await axios.get("/api/kroger/featured");
				if (data.success) {
					setFeaturedProducts(data.products.slice(0, 5));
				} else {
					toast.error(data.message || "Failed to load featured products");
				}
			} catch (error) {
				console.error("Featured products error:", error);
				toast.error("Failed to load featured products");
			}
		};
		fetchFeatured();
	}, []);

	if (!featuredProducts || featuredProducts.length === 0) return null;

	return (
		<section className="mt-20 relative">
			<div className="absolute inset-0 -mx-4 sm:-mx-8 lg:-mx-16 xl:-mx-24 rounded-3xl bg-playful-gradient bg-dot-pattern opacity-60 -z-10" />

			<div className="py-10 px-4 sm:px-8 lg:px-12">
				<div className="flex flex-col items-center w-max mx-auto">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-forest-green/70 mb-2">
						fan favorites
					</p>
					<h2 className="text-3xl md:text-4xl font-bold text-primary-forest-green">
						top{" "}
						<span className="text-secondary-golden-honey">sellers</span>
					</h2>
					<div className="w-20 h-1 bg-primary-sage-green rounded-full mt-3" />
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 lg:grid-cols-5 mt-8 w-full">
					{featuredProducts.map((product, index) => (
						<ProductCard key={index} product={product} />
					))}
				</div>
			</div>
		</section>
	);
};

export default TopSellers;
