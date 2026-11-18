import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import Categories, { getCategoryLabel } from "../components/Categories";

const Products = () => {
	const {
		products,
		searchQuery,
		setSearchQuery,
		getProductsByCategory,
		searchProducts,
		fetchProducts,
		loading,
	} = useAppContext();
	const [searchParams, setSearchParams] = useSearchParams();
	const [filteredProducts, setFilteredProducts] = useState([]);

	const categoryParam = searchParams.get("category");
	const searchParam = searchParams.get("search");
	const labelParam = searchParams.get("label");

	useEffect(() => {
		if (categoryParam) {
			getProductsByCategory(categoryParam);
		} else if (searchParam) {
			searchProducts(searchParam);
		} else {
			fetchProducts();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [categoryParam, searchParam]);

	useEffect(() => {
		if (searchQuery && searchQuery.length > 0) {
			setFilteredProducts(
				products.filter((item) =>
					item.name?.toLowerCase().includes(searchQuery.toLowerCase()),
				),
			);
		} else {
			setFilteredProducts(products);
		}
	}, [searchQuery, products]);

	const activeLabel =
		labelParam ||
		(categoryParam && getCategoryLabel(categoryParam)) ||
		(searchParam && getCategoryLabel(searchParam)) ||
		null;

	const clearFilter = () => {
		setSearchParams({});
		setSearchQuery("");
		fetchProducts();
		scrollTo(0, 0);
	};

	return (
		<div className="mt-16 flex flex-col flex-auto">
			<div className="relative rounded-3xl bg-playful-gradient bg-dot-pattern p-6 sm:p-8 mb-8">
				<div className="flex flex-col items-start sm:items-end w-max">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-forest-green/70 mb-1">
						{activeLabel ? "showing results for" : "browse"}
					</p>
					<h1 className="text-3xl md:text-4xl font-bold text-gradient">
						{activeLabel || "all products"}
					</h1>
					<div className="w-16 h-1 bg-primary-sage-green rounded-full mt-3" />
				</div>

				{activeLabel && (
					<button
						onClick={clearFilter}
						className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-warm-white text-primary-forest-green text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition border border-primary-forest-green/10"
					>
						<span>clear filter</span>
						<span className="text-secondary-golden-honey">×</span>
					</button>
				)}
			</div>

			<Categories />

			{loading ? (
				<div className="flex items-center justify-center py-20">
					<div className="w-10 h-10 border-4 border-primary-sage-green border-t-secondary-golden-honey rounded-full animate-spin" />
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
					{filteredProducts.map((item, index) => (
						<ProductCard key={index} product={item} />
					))}
				</div>
			)}

			{!loading && filteredProducts.length === 0 && (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<p className="text-2xl font-medium text-primary-forest-green">
						no products found
					</p>
					<p className="text-primary-forest-green/60 mt-2">
						Try clearing the filter or searching for something else.
					</p>
				</div>
			)}
		</div>
	);
};

export default Products;
