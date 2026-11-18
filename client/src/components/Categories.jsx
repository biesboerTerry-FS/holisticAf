import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";

export const categoryList = [
	{
		text: "Herbs & Botanicals",
		path: "herbs-botanicals",
		searchTerm: "herbs",
		backendKey: "herbs-botanicals",
		subcategories: [
			{ text: "Adaptogens", path: "adaptogens", searchTerm: "adaptogens", backendKey: "herbs-botanicals" },
			{ text: "Roots", path: "roots", searchTerm: "roots", backendKey: "herbs-botanicals" },
			{ text: "Leaves", path: "leaves", searchTerm: "leaves", backendKey: "herbs-botanicals" },
		],
	},
	{
		text: "Teas & Tonics",
		path: "teas-tonics",
		searchTerm: "tea",
		backendKey: "teas-tonics",
		subcategories: [
			{ text: "Green Tea", path: "green-tea", searchTerm: "green tea", backendKey: "teas-tonics" },
			{ text: "Calming", path: "calming", searchTerm: "calming", backendKey: "teas-tonics" },
			{ text: "Herbal", path: "herbal", searchTerm: "herbal", backendKey: "teas-tonics" },
		],
	},
	{
		text: "Superfoods",
		path: "superfoods",
		searchTerm: "superfood",
		backendKey: "superfoods",
		subcategories: [
			{ text: "Seeds", path: "seeds", searchTerm: "seeds", backendKey: "superfoods" },
			{ text: "Powders", path: "powders", searchTerm: "powders", backendKey: "superfoods" },
			{ text: "Berries", path: "berries", searchTerm: "berries", backendKey: "superfoods" },
		],
	},
	{
		text: "Supplements",
		path: "supplements",
		searchTerm: "supplements",
		backendKey: "supplements",
		subcategories: [
			{ text: "Minerals", path: "minerals", searchTerm: "minerals", backendKey: "supplements" },
			{ text: "Vitamins", path: "vitamins", searchTerm: "vitamins", backendKey: "supplements" },
			{ text: "Gut Health", path: "gut-health", searchTerm: "gut health", backendKey: "supplements" },
		],
	},
	{
		text: "Pantry & Whole Foods",
		path: "pantry-whole-foods",
		searchTerm: "whole foods",
		backendKey: "pantry-whole-foods",
		subcategories: [
			{ text: "Grains", path: "grains", searchTerm: "grains", backendKey: "pantry-whole-foods" },
			{ text: "Sweeteners", path: "sweeteners", searchTerm: "honey", backendKey: "pantry-whole-foods" },
			{ text: "Oils", path: "oils", searchTerm: "oil", backendKey: "pantry-whole-foods" },
		],
	},
	{
		text: "Body & Wellness",
		path: "body-care-wellness",
		searchTerm: "wellness",
		backendKey: "body-care-wellness",
		subcategories: [
			{ text: "Aromatherapy", path: "aromatherapy", searchTerm: "aromatherapy", backendKey: "body-care-wellness" },
			{ text: "Bath", path: "bath", searchTerm: "bath", backendKey: "body-care-wellness" },
			{ text: "Skin", path: "skin", searchTerm: "skin", backendKey: "body-care-wellness" },
		],
	},
];

export const getCategoryLabel = (value) => {
	if (!value) return null;
	const needle = value.toLowerCase();
	for (const cat of categoryList) {
		if (
			cat.path.toLowerCase() === needle ||
			cat.backendKey?.toLowerCase() === needle ||
			cat.searchTerm?.toLowerCase() === needle
		) {
			return cat.text;
		}
		for (const sub of cat.subcategories || []) {
			if (
				sub.path.toLowerCase() === needle ||
				sub.backendKey?.toLowerCase() === needle ||
				sub.searchTerm?.toLowerCase() === needle
			) {
				return `${cat.text} — ${sub.text}`;
			}
		}
	}
	return value.charAt(0).toUpperCase() + value.slice(1);
};

const Categories = () => {
	const { navigate, getProductsByCategory, searchProducts } = useAppContext();
	const [categories] = useState(categoryList);
	const [openCategory, setOpenCategory] = useState(null);
	const containerRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target)
			) {
				setOpenCategory(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const applyFilter = (item, parentText) => {
		const label = parentText
			? `${parentText} — ${item.text}`
			: item.text;

		if (item.backendKey) {
			getProductsByCategory(item.backendKey);
			navigate(
				`/products?category=${encodeURIComponent(item.backendKey)}&label=${encodeURIComponent(label)}`,
			);
		} else {
			const term = item.searchTerm || item.path;
			searchProducts(term);
			navigate(
				`/products?search=${encodeURIComponent(term)}&label=${encodeURIComponent(label)}`,
			);
		}

		setOpenCategory(null);
		scrollTo(0, 0);
	};

	const toggleCategory = (e, categoryPath) => {
		e.stopPropagation();
		setOpenCategory((prev) => (prev === categoryPath ? null : categoryPath));
	};

	return (
		<section className="mt-20" ref={containerRef}>
			<div className="flex flex-col gap-2">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-forest-green/70">
					explore
				</p>
				<h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary-forest-green">
					shop by{" "}
					<span className="text-secondary-golden-honey">category</span>
				</h2>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mt-8 w-full">
				{categories.map((category) => (
					<div key={category.path} className="relative">
						<div className="group w-full h-full min-h-28 flex flex-col items-start justify-between gap-3 text-left p-4 md:p-5 rounded-3xl bg-primary-warm-white border border-primary-forest-green/10 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-secondary-golden-honey/60 transition-all duration-300 cursor-pointer focus-within:outline-2 focus-within:outline-secondary-golden-honey overflow-hidden">
							<div className="absolute top-0 right-0 w-16 h-16 bg-secondary-golden-honey/10 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />

							<button
								type="button"
								onClick={() => applyFilter(category)}
								className="w-full text-left"
							>
								<span className="text-sm md:text-base font-bold leading-snug text-primary-forest-green">
									{category.text}
								</span>
							</button>

							<div className="w-full flex items-center justify-between">
								<span className="text-xs text-neutral-medium-gray group-hover:text-secondary-earthy-brown transition">
									browse
								</span>
								<button
									type="button"
									onClick={(e) => toggleCategory(e, category.path)}
									aria-expanded={openCategory === category.path}
									aria-label={`Browse ${category.text} types`}
									className="w-7 h-7 flex items-center justify-center rounded-full bg-primary-sage-green/20 text-primary-forest-green hover:bg-secondary-golden-honey hover:text-neutral-charcoal transition"
								>
									{openCategory === category.path ? "−" : "+"}
								</button>
							</div>
						</div>

						{openCategory === category.path &&
							category.subcategories?.length > 0 && (
								<div className="absolute z-50 top-full left-0 mt-2 w-56 rounded-2xl bg-primary-warm-white border border-primary-forest-green/10 shadow-xl overflow-hidden">
									<ul className="py-1">
										{category.subcategories.map((sub) => (
											<li key={sub.path}>
												<button
													type="button"
													onClick={() =>
														applyFilter(
															sub,
															category.text,
														)
													}
													className="w-full px-4 py-2.5 text-left text-sm font-medium text-primary-forest-green hover:bg-primary-sage-green/20 transition cursor-pointer"
												>
													{sub.text}
												</button>
											</li>
										))}
										</ul>
									</div>
								)}
						</div>
					))}
				</div>
			</section>
	);
};

export default Categories;
