import express from "express";
import { fetchHolisticMealProducts } from "../utils/themealdbProducts.js";
import KrogerProduct from "../models/KrogerProduct.js";

const router = express.Router();

// Local holisticAF categories that live in the KrogerProduct collection.
const LOCAL_CATEGORIES = new Set([
	"herbs-botanicals",
	"teas-tonics",
	"superfoods",
	"supplements",
	"pantry-whole-foods",
	"body-care-wellness",
]);

// Map URL-friendly category names to TheMealDB categories.
const categoryMap = {
	vegetables: "Vegetarian",
	vegetarian: "Vegetarian",
	vegan: "Vegan",
	seafood: "Seafood",
	salads: "Side",
	sides: "Side",
	grains: "Side",
	desserts: "Dessert",
	breakfast: "Breakfast",
	pasta: "Pasta",
	miscellaneous: "Miscellaneous",
	starter: "Starter",
	starters: "Starter",
	"fruit-vegetables": "Vegetarian",
	"natural-organic": "Vegetarian",
	healthy: "Vegetarian",
	organic: "Vegetarian",
};

// Public search endpoint (used by AppContext initial load and ProductSearch).
router.get("/search", async (request, response) => {
	try {
		const { query = "healthy", limit = 50 } = request.query;
		const trimmedQuery = String(query).trim();

		if (!trimmedQuery) {
			return response
				.status(400)
				.json({ success: false, message: "Query required" });
		}

		const normalized = trimmedQuery.toLowerCase();
		const max = Number(limit) || 50;

		// Search locally seeded products first.
		const local = await KrogerProduct.find({
			$or: [
				{ name: { $regex: normalized, $options: "i" } },
				{ category: { $regex: normalized, $options: "i" } },
				{ subCategory: { $regex: normalized, $options: "i" } },
				{ description: { $regex: normalized, $options: "i" } },
				{ tags: { $in: [new RegExp(normalized, "i")] } },
			],
		})
			.sort({ createdAt: -1 })
			.limit(max)
			.lean();

		// For broad generic terms, also blend TheMealDB recipes so the storefront never feels empty.
		let mealProducts = [];
		const category = categoryMap[normalized];
		if (local.length < max) {
			mealProducts = category
				? await fetchHolisticMealProducts({ category, limit: max - local.length })
				: await fetchHolisticMealProducts({ query: trimmedQuery, limit: max - local.length });
		}

		const products = local.concat(mealProducts);

		console.log(
			`Returning ${products.length} products for query "${trimmedQuery}" (local: ${local.length}, TheMealDB: ${mealProducts.length})`,
		);

		response.json({
			success: true,
			products,
			total: products.length,
			sources: { local: local.length, themealdb: mealProducts.length },
		});
	} catch (error) {
		console.error("Search error:", error.message);
		response.json({ success: false, message: error.message });
	}
});

// Category browse endpoint.
router.get("/category/:category", async (request, response) => {
	try {
		const { category } = request.params;
		const { limit = 50 } = request.query;
		const normalized = String(category || "").toLowerCase();
		console.log("Category query:", category);

		// Prefer locally seeded products for our own category slugs.
		if (LOCAL_CATEGORIES.has(normalized)) {
			const local = await KrogerProduct.find({ category: normalized })
				.sort({ createdAt: -1 })
				.limit(Number(limit) || 50)
				.lean();
			if (local.length > 0) {
				return response.json({
					success: true,
					products: local,
					total: local.length,
					sources: { local: local.length, themealdb: 0 },
				});
			}
		}

		const mealCategory = categoryMap[normalized] || "";

		const products = mealCategory
			? await fetchHolisticMealProducts({ category: mealCategory, limit: Number(limit) || 50 })
			: await fetchHolisticMealProducts({ query: category, limit: Number(limit) || 50 });

		response.json({
			success: true,
			products,
			total: products.length,
			sources: { themealdb: products.length, local: 0 },
		});
	} catch (error) {
		console.error("Category error:", error.message);
		response.json({ success: false, message: error.message });
	}
});

// Featured / top sellers endpoint.
router.get("/featured", async (_request, response) => {
	try {
		// Curate top sellers from locally seeded products.
		const local = await KrogerProduct.find({
			category: { $in: Array.from(LOCAL_CATEGORIES) },
		})
			.sort({ offerPrice: -1 })
			.limit(8)
			.lean();

		let products = local;
		if (local.length < 8) {
			const mealProducts = await fetchHolisticMealProducts({
				category: "Vegetarian",
				limit: 8 - local.length,
			});
			products = local.concat(mealProducts);
		}

		response.json({
			success: true,
			products,
			total: products.length,
			sources: { local: local.length, themealdb: products.length - local.length },
		});
	} catch (error) {
		console.error("Featured error:", error.message);
		response.json({ success: false, message: error.message });
	}
});

// Category list returned to the frontend.
router.get("/categories", (_request, response) => {
	response.json({
		success: true,
		categories: [
			"Vegetarian",
			"Vegan",
			"Seafood",
			"Sides & Salads",
			"Starters",
			"Pasta",
			"Breakfast",
			"Desserts",
			"Holistic Meals",
		],
	});
});

export default router;
