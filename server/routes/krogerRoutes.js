import express from "express";
import { fetchHolisticMealProducts } from "../utils/themealdbProducts.js";

const router = express.Router();

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

		const category = categoryMap[trimmedQuery.toLowerCase()];
		const products = category
			? await fetchHolisticMealProducts({ category, limit: Number(limit) || 50 })
			: await fetchHolisticMealProducts({ query: trimmedQuery, limit: Number(limit) || 50 });

		console.log(
			`Returning ${products.length} TheMealDB products for query "${trimmedQuery}"`,
		);

		response.json({
			success: true,
			products,
			total: products.length,
			sources: { themealdb: products.length, kroger: 0 },
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
		console.log("Category query:", category);

		const mealCategory =
			categoryMap[String(category || "").toLowerCase()] || "";

		const products = mealCategory
			? await fetchHolisticMealProducts({ category: mealCategory, limit: Number(limit) || 50 })
			: await fetchHolisticMealProducts({ query: category, limit: Number(limit) || 50 });

		response.json({
			success: true,
			products,
			total: products.length,
			sources: { themealdb: products.length, kroger: 0 },
		});
	} catch (error) {
		console.error("Category error:", error.message);
		response.json({ success: false, message: error.message });
	}
});

// Featured / top sellers endpoint.
router.get("/featured", async (_request, response) => {
	try {
		const products = await fetchHolisticMealProducts({
			category: "Vegetarian",
			limit: 20,
		});
		response.json({
			success: true,
			products,
			total: products.length,
			sources: { themealdb: products.length, kroger: 0 },
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
