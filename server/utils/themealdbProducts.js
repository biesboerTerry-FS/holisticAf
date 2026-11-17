import axios from "axios";

const BASE_URL = process.env.MEALDB_API_URL || "https://www.themealdb.com/api/json/v1/1";

// Map TheMealDB categories to holisticAF-facing categories.
const categoryDisplayNames = {
	Vegetarian: "Vegetarian",
	Vegan: "Vegan",
	Seafood: "Seafood",
	Side: "Sides & Salads",
	Starter: "Starters",
	Dessert: "Desserts",
	Breakfast: "Breakfast",
	Pasta: "Pasta",
	Miscellaneous: "Holistic Meals",
};

// Search terms that should resolve to a curated category pull instead of a literal search.
const HOLISTIC_SEARCH_ALIASES = {
	healthy: ["Vegetarian", "Vegan", "Seafood", "Side"],
	organic: ["Vegetarian", "Vegan", "Side"],
	holistic: ["Vegetarian", "Vegan", "Miscellaneous"],
	vegetables: ["Vegetarian", "Side"],
	veggie: ["Vegetarian", "Vegan"],
	plant: ["Vegetarian", "Vegan"],
	green: ["Vegetarian", "Side"],
	clean: ["Vegetarian", "Vegan", "Seafood"],
};

const HOLISTIC_KEYWORDS = [
	"organic",
	"vegan",
	"vegetarian",
	"plant",
	"salad",
	"grain",
	"quinoa",
	"lentil",
	"bean",
	"chickpea",
	"tofu",
	"oat",
	"brown rice",
	"whole",
	"vegetable",
	"veggie",
	"herb",
	"smoothie",
	"fruit",
	"seed",
	"nut",
	"avocado",
	"kale",
	"spinach",
	"broccoli",
	"sweet potato",
	"mediterranean",
	"detox",
	"green",
	"fiber",
	"fresh",
	"light",
	"raw",
];

const EXCLUDED_TERMS = [
	"beef",
	"pork",
	"bacon",
	"ham",
	"sausage",
	"lamb",
	"fried chicken",
	"burger",
	"pepperoni",
];

function hashString(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
}

function extractIngredients(meal) {
	const ingredients = [];
	for (let i = 1; i <= 20; i++) {
		const name = (meal[`strIngredient${i}`] || "").trim();
		const measure = (meal[`strMeasure${i}`] || "").trim();
		if (!name) continue;
		ingredients.push(measure ? `${measure} ${name}`.trim() : name);
	}
	return ingredients;
}

function isHolisticMeal(meal, query = "") {
	const text = [
		meal.strMeal,
		meal.strCategory,
		meal.strArea,
		meal.strTags,
		meal.strInstructions,
		...extractIngredients(meal).slice(0, 8),
	]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();

	const q = String(query || "").toLowerCase();
	const hasExcluded = EXCLUDED_TERMS.some((term) => text.includes(term));
	const keywordHits = HOLISTIC_KEYWORDS.filter((k) => text.includes(k)).length;
	const queryLooksHolistic = HOLISTIC_KEYWORDS.some((k) => q.includes(k));

	if (q && HOLISTIC_KEYWORDS.some((k) => k === q || q.includes(k)) && text.includes(q)) {
		return !hasExcluded;
	}

	if (hasExcluded && keywordHits < 2) return false;
	if (keywordHits >= 2) return true;
	if (queryLooksHolistic && keywordHits >= 1) return true;
	return false;
}

function transformMeal(meal) {
	const ingredients = extractIngredients(meal);
	const seed = hashString(String(meal.idMeal || meal.strMeal || "meal"));
	const regularPrice = Number((10 + (seed % 1200) / 100).toFixed(2)); // $10.00 - $21.99
	const offerPrice = Number((regularPrice * 0.9).toFixed(2));
	const rawCategory = meal.strCategory || "Holistic Meals";
	const category = categoryDisplayNames[rawCategory] || rawCategory;
	const tags = (meal.strTags || "")
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);

	return {
		productId: `mealdb-${meal.idMeal}`,
		externalId: `mealdb-${meal.idMeal}`,
		upc: `mealdb-${meal.idMeal}`,
		name: meal.strMeal,
		brand: "holisticAF Organic",
		description:
			ingredients.length > 0
				? `Holistic meal inspiration with ingredients: ${ingredients.slice(0, 8).join(", ")}.`
				: meal.strInstructions
					? `${String(meal.strInstructions).slice(0, 140)}...`
					: "Holistic meal inspiration.",
		regularPrice,
		offerPrice,
		price: { regular: regularPrice, sale: offerPrice },
		image: [meal.strMealThumb || "https://via.placeholder.com/300x300?text=Meal"],
		category,
		subCategory: meal.strArea || "Recipe",
		size: ingredients.length ? `${ingredients.length} ingredients` : "",
		source: "themealdb",
		isMealDbProduct: true,
		stock: 100,
		tags,
		ingredients,
	};
}

async function fetchMeals(url) {
	const { data } = await axios.get(url, { timeout: 10000 });
	return Array.isArray(data?.meals) ? data.meals : [];
}

async function fetchMealDetails(idMeal) {
	const meals = await fetchMeals(`${BASE_URL}/lookup.php?i=${encodeURIComponent(idMeal)}`);
	return meals[0] || null;
}

async function fetchByCategory(category, max) {
	const list = await fetchMeals(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
	const detailed = await Promise.all(
		list.slice(0, max * 2).map(async (m) => {
			try {
				return await fetchMealDetails(m.idMeal);
			} catch {
				return null;
			}
		}),
	);
	return detailed.filter(Boolean);
}

async function fetchByCategories(categories, maxPerCategory) {
	const results = await Promise.all(
		categories.map(async (category) => {
			try {
				return await fetchByCategory(category, maxPerCategory);
			} catch {
				return [];
			}
		}),
	);
	return results.flat();
}

export async function fetchHolisticMealProducts({ query = "", category = "", limit = 12 } = {}) {
	try {
		const max = Math.max(1, Math.min(Number(limit) || 12, 50));
		let meals = [];

		if (category) {
			// Resolve display category back to TheMealDB category name if needed.
			const reverseMap = Object.fromEntries(
				Object.entries(categoryDisplayNames).map(([k, v]) => [v.toLowerCase(), k]),
			);
			const dbCategory = reverseMap[category.toLowerCase()] || category;
			meals = await fetchByCategory(dbCategory, max);
		} else if (query) {
			const q = query.toLowerCase();
			const aliasCategories = HOLISTIC_SEARCH_ALIASES[q];

			if (aliasCategories) {
				// Curated multi-category pull for broad holistic terms.
				const perCategory = Math.max(4, Math.floor(max / aliasCategories.length));
				meals = await fetchByCategories(aliasCategories, perCategory);
			} else {
				meals = await fetchMeals(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
				if (meals.length === 0) {
					// Try ingredient filter.
					const list = await fetchMeals(
						`${BASE_URL}/filter.php?i=${encodeURIComponent(query)}`,
					);
					const detailed = await Promise.all(
						list.slice(0, max).map(async (m) => {
							try {
								return await fetchMealDetails(m.idMeal);
							} catch {
								return null;
							}
						}),
					);
					meals = detailed.filter(Boolean);
				}
			}
		} else {
			// No query or category: return a curated holistic mix.
			meals = await fetchByCategories(["Vegetarian", "Vegan", "Seafood", "Side"], Math.ceil(max / 4));
		}

		const unique = [];
		const seen = new Set();
		for (const meal of meals) {
			const id = meal?.idMeal;
			if (!id || seen.has(id)) continue;
			seen.add(id);
			if (isHolisticMeal(meal, query || category)) unique.push(meal);
		}

		return unique.slice(0, max).map(transformMeal);
	} catch (error) {
		console.error("TheMealDB fetch error:", error.message);
		return [];
	}
}

export function mergeWithMealDbProducts(primaryProducts = [], mealProducts = []) {
	if (!Array.isArray(mealProducts) || mealProducts.length === 0) return primaryProducts;
	if (!Array.isArray(primaryProducts) || primaryProducts.length === 0) return mealProducts;
	const out = [...primaryProducts];
	const insertAt = Math.min(3, out.length);
	out.splice(insertAt, 0, ...mealProducts.slice(0, 6));
	return out.concat(mealProducts.slice(6));
}
