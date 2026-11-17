import mongoose from "mongoose";

// Originally named KrogerProduct for historical seed compatibility.
// This collection now holds both manually seeded local products and
// free-API product data (TheMealDB) used by the storefront.
const KrogerProductSchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String },
	brand: { type: String, default: "holisticAF Organic" },
	regularPrice: { type: Number, default: 0 },
	offerPrice: { type: Number, default: 0 },
	price: {
		regular: { type: Number },
		sale: { type: Number },
	},
	image: [{ type: String }],
	category: { type: String, required: true },
	subCategory: { type: String },
	stock: { type: Number, default: 100 },
	externalId: { type: String, sparse: true },
	upc: { type: String, unique: true, sparse: true },
	productId: { type: String },
	size: { type: String },
	source: { type: String, default: "local" },
	isKrogerProduct: { type: Boolean, default: false },
	isMealDbProduct: { type: Boolean, default: false },
	ingredients: [{ type: String }],
	tags: [{ type: String }],
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

const KrogerProduct =
	mongoose.models.KrogerProduct ||
	mongoose.model("KrogerProduct", KrogerProductSchema, "krogerproducts");

export default KrogerProduct;
