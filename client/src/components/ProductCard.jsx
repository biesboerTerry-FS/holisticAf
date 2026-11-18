import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { getCategoryLabel } from "./Categories";

const ProductCard = ({ product }) => {
	const { currency, addToCart, removeFromCart, cartItems, navigate } =
		useAppContext();

	if (!product) return null;

	const productId =
		product._id || product.productId || product.externalId || product.upc || product.id;

	const regularPrice =
		product.regularPrice?.regular ??
		product.price?.regular ??
		product.price ??
		0;

	const offerPrice =
		product.offerPrice ?? product.price?.sale ?? regularPrice;

	const resolveImage = () => {
		if (product.image) {
			return Array.isArray(product.image)
				? product.image[0]
				: product.image;
		}

		if (product.upc) {
			return `/api/media/image?upc=${product.upc}`;
		}

		return assets.leaf;
	};

	const imageSrc = resolveImage();

	const handleNavigation = () => {
		if (product?.category && productId) {
			navigate(`/products/${product.category?.toLowerCase()}/${productId}`);
			scrollTo(0, 0);
		}
	};

	return (
		<div
			onClick={handleNavigation}
			className="group relative bg-primary-warm-white rounded-3xl border border-primary-forest-green/10 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden"
		>
			{product.category && (
				<span className="absolute top-3 left-3 z-10 inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-charcoal bg-secondary-golden-honey rounded-full shadow-sm">
					{getCategoryLabel(product.category) || product.category}
				</span>
			)}

			<div className="flex items-center justify-center bg-primary-cream/60 p-5 h-48 sm:h-56">
				<img
					className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
					src={imageSrc}
					alt={product.name || "product image"}
					onError={(event) => {
						event.target.src = assets.leaf;
					}}
				/>
			</div>

			<div className="p-4 sm:p-5">
				{product.brand && (
					<p className="text-xs font-semibold uppercase tracking-wide text-primary-sage-green mb-1">
						{product.brand}
					</p>
				)}

				<h3 className="text-primary-forest-green font-semibold text-base sm:text-lg leading-snug line-clamp-2 min-h-[3rem]">
					{product.name?.toLowerCase() || "holistic product"}
				</h3>

				{product.description && (
					<p className="text-primary-forest-green/60 text-sm mt-1 line-clamp-2">
						{product.description.toLowerCase()}
					</p>
				)}

				<div className="flex items-center justify-between mt-4">
					<div className="flex items-center gap-2">
						<span className="inline-flex items-center px-3 py-1 bg-primary-forest-green text-primary-warm-white rounded-full text-sm font-bold shadow-sm">
							{currency}
							{Number(offerPrice).toFixed(2)}
						</span>
						{offerPrice !== regularPrice && (
							<span className="text-primary-forest-green/50 text-sm line-through">
								{currency}
								{Number(regularPrice).toFixed(2)}
							</span>
						)}
					</div>

					<div
						onClick={(event) => event.stopPropagation()}
						className="flex-shrink-0"
					>
						{!cartItems[productId] ? (
							<button
								className="flex items-center justify-center gap-1.5 w-10 h-10 rounded-full bg-secondary-golden-honey text-neutral-charcoal hover:bg-secondary-golden-honey/80 hover:scale-105 transition shadow-sm"
								onClick={() => addToCart(productId)}
								aria-label="Add to cart"
							>
								<img src={assets.cart} alt="cart icon" className="w-4 h-4" />
							</button>
						) : (
							<div className="flex items-center justify-center gap-1 w-28 h-10 rounded-full bg-primary-cream border border-primary-forest-green/10 select-none">
								<button
									onClick={() => removeFromCart(productId)}
									className="cursor-pointer w-8 h-full text-lg font-medium text-primary-forest-green hover:text-secondary-golden-honey transition"
								>
									-
								</button>
								<span className="w-6 text-center text-sm font-semibold text-primary-forest-green">
									{cartItems[productId]}
								</span>
								<button
									onClick={() => addToCart(productId)}
									className="cursor-pointer w-8 h-full text-lg font-medium text-primary-forest-green hover:text-secondary-golden-honey transition"
								>
									+
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
