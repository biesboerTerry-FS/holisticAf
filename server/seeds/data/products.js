const CATEGORY_COLORS = {
	"herbs-botanicals": { bg: "1e4d43", text: "e9b04a" },
	"teas-tonics": { bg: "f5f3ee", text: "1e4d43" },
	"superfoods": { bg: "e9b04a", text: "1e4d43" },
	"supplements": { bg: "9dbfaf", text: "1e4d43" },
	"pantry-whole-foods": { bg: "d9f2e8", text: "1e4d43" },
	"body-care-wellness": { bg: "d9f2e8", text: "1e4d43" },
};

const placeholderImage = (category, name) => {
	const colors = CATEGORY_COLORS[category] || { bg: "1e4d43", text: "e9b04a" };
	const text = encodeURIComponent(name);
	return `https://placehold.co/400x400/${colors.bg}/${colors.text}?text=${text}`;
};

const item = (category, subCategory, name, description, size, price, offerPrice, stock = 60) => ({
	name,
	brand: "holisticAF",
	description,
	size,
	category,
	subCategory,
	regularPrice: price,
	offerPrice,
	price: { regular: price, sale: offerPrice },
	image: [placeholderImage(category, name)],
	stock,
	externalId: `${category}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
	isKrogerProduct: false,
});

const products = [
	item("herbs-botanicals", "adaptogens", "Ashwagandha Root Powder", "Organic root powder traditionally used to support stress resilience and restful sleep.", "8 oz", 18, 15),
	item("herbs-botanicals", "adaptogens", "Holy Basil (Tulsi) Leaf", "Sacred basil leaf for calming teas, daily rituals and balance.", "2 oz", 9, 7),
	item("herbs-botanicals", "roots", "Turmeric Root Powder", "Stone-ground turmeric root with a warm, earthy flavor for golden milk and curries.", "6 oz", 11, 9),
	item("herbs-botanicals", "roots", "Ginger Root Powder", "Dried, finely ground ginger root for teas, smoothies and baking.", "4 oz", 8, 6),
	item("herbs-botanicals", "leaves", "Moringa Leaf Powder", "Nutrient-dense leaf powder rich in vitamins and plant protein.", "8 oz", 14, 12),
	item("herbs-botanicals", "culinary", "Culinary Lavender Buds", "Food-grade lavender buds for baking, infusions and calming blends.", "1 oz", 10, 8),

	item("teas-tonics", "green-tea", "Ceremonial Matcha", "Shade-grown Japanese matcha for smooth, focused energy without the jitters.", "3 oz", 26, 22),
	item("teas-tonics", "calming", "Chamomile Flowers", "Whole chamomile blossoms for a gentle, soothing evening cup.", "2 oz", 8, 6),
	item("teas-tonics", "herbal", "Hibiscus Blossom Tea", "Tart, ruby-red hibiscus rich in antioxidants. Enjoy hot or iced.", "4 oz", 9, 7),
	item("teas-tonics", "herbal", "Rooibos Vanilla Tea", "Caffeine-free South African rooibos with a naturally sweet vanilla finish.", "4 oz", 9, 8),
	item("teas-tonics", "tonics", "Golden Milk Blend", "Turmeric, ginger, cinnamon and black pepper blended for a warming nightly drink.", "3 oz", 13, 11),
	item("teas-tonics", "tonics", "Organic Kombucha Starter", "Live SCOBY starter culture for brewing your own probiotic kombucha at home.", "1 each", 16, 14),

	item("superfoods", "seeds", "Organic Chia Seeds", "Fiber- and omega-3-rich chia seeds for puddings, oats and smoothies.", "16 oz", 9, 7),
	item("superfoods", "seeds", "Hulled Hemp Hearts", "Soft, nutty hemp seeds with complete plant protein and healthy fats.", "12 oz", 13, 11),
	item("superfoods", "berries", "Dried Goji Berries", "Sweet-tart goji berries packed with antioxidants and vitamin C.", "8 oz", 10, 8),
	item("superfoods", "powders", "Raw Cacao Powder", "Unsweetened, minimally processed cacao for a rich mood-boosting chocolate flavor.", "8 oz", 12, 10),
	item("superfoods", "powders", "Maca Root Powder", "Peruvian maca root powder with a malty flavor, used for energy and vitality.", "8 oz", 15, 13),
	item("superfoods", "algae", "Organic Spirulina Powder", "Blue-green algae powder high in plant protein, iron and B vitamins.", "8 oz", 17, 14),

	item("supplements", "minerals", "Magnesium Glycinate", "Highly absorbable magnesium to support muscle relaxation and sleep quality.", "120 caps", 22, 19),
	item("supplements", "vitamins", "Vitamin D3 + K2", "Daily D3 with K2 (MK-7) to support bone and immune health.", "60 caps", 18, 15),
	item("supplements", "essential-fats", "Omega-3 Fish Oil", "Third-party tested fish oil with EPA and DHA for heart and brain support.", "90 softgels", 26, 22),
	item("supplements", "gut-health", "Daily Probiotic", "Multi-strain probiotic with 20 billion CFU to support digestive balance.", "60 caps", 29, 25),
	item("supplements", "beauty", "Marine Collagen Peptides", "Hydrolyzed marine collagen that dissolves easily in hot or cold drinks.", "10 oz", 32, 28),
	item("supplements", "immunity", "Elderberry Gummies", "Black elderberry gummies with vitamin C and zinc for seasonal support.", "60 gummies", 17, 14),

	item("pantry-whole-foods", "grains", "Organic Tri-Color Quinoa", "Protein-rich ancient grain, rinsed and ready for bowls and salads.", "16 oz", 8, 6),
	item("pantry-whole-foods", "grains", "Steel-Cut Oats", "Hearty whole-grain oats with a slow-release energy profile.", "24 oz", 7, 6),
	item("pantry-whole-foods", "sweeteners", "Raw Wildflower Honey", "Unpasteurized local honey with natural enzymes and a floral finish.", "12 oz", 12, 10),
	item("pantry-whole-foods", "vinegars", "Raw Apple Cider Vinegar", "Unfiltered, with the mother. Start your day with a tablespoon in warm water.", "32 oz", 11, 9),
	item("pantry-whole-foods", "oils", "Cold-Pressed Extra Virgin Olive Oil", "Single-estate olive oil pressed within hours of harvest.", "500 ml", 19, 16),
	item("pantry-whole-foods", "legumes", "Sprouted Green Lentils", "Sprouted for easier digestion and higher nutrient availability.", "16 oz", 6, 5),

	item("body-care-wellness", "aromatherapy", "Lavender Essential Oil", "100% pure steam-distilled lavender oil for diffusing and topical blends.", "15 ml", 14, 12),
	item("body-care-wellness", "aromatherapy", "Eucalyptus & Mint Oil", "Invigorating eucalyptus and peppermint blend for breathing and focus.", "15 ml", 13, 11),
	item("body-care-wellness", "bath", "Lavender Epsom Salt Soak", "Magnesium-rich Epsom salt with lavender for a restorative bath.", "3 lb", 12, 10),
	item("body-care-wellness", "skin", "Cold-Pressed Rosehip Oil", "Nourishing facial oil rich in vitamin A and essential fatty acids.", "30 ml", 21, 18),
	item("body-care-wellness", "skin", "Organic Aloe Vera Gel", "Pure, soothing aloe gel for skin, after-sun and daily hydration.", "12 oz", 9, 7),
];

export default products;
