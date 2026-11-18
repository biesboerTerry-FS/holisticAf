import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import KrogerProduct from "../models/KrogerProduct.js";

// ^ add new product: /api/inventory/add-inventory`
export const addProduct = async (request, response) => {
	try {
		let productData = JSON.parse(request.body.productData);

		const images = request.files;

		let imagesUrl = await Promise.all(
			images.map(async (item) => {
				let result = await cloudinary.uploader.upload(item.path, {
					resource_type: "image",
				});
				return result.secure_url;
			}),
		);

		await KrogerProduct.create({ ...productData, image: imagesUrl });

		response.json({
			success: true,
			message: "Product added.",
		});
	} catch (error) {
		console.log(error.message);
		response.json({
			success: false,
			error: error.message,
		});
	}
};

// ^ get all products: /api/inventory/
export const inventoryList = async (request, response) => {
	try {
		const filter = {};
		const source = String(request.query.source || "").trim().toLowerCase();
		if (source === "local") {
			filter.$or = [{ source: "local" }, { isKrogerProduct: false, isMealDbProduct: { $ne: true } }];
		} else if (source === "themealdb") {
			filter.isMealDbProduct = true;
		}
		const products = await KrogerProduct.find(filter);
		response.json({
			success: true,
			products,
		});
	} catch (error) {
		console.log(error.message);
		response.json({
			success: false,
			error: error.message,
		});
	}
};

// ^ get product by id: /api/inventory/:id
export const productById = async (request, response) => {
	try {
		const { id } = request.params.id;
		const product = await KrogerProduct.findById(id);
		response.json({
			success: true,
			product,
		});
	} catch (error) {
		console.log(error.message);
		response.json({
			success: false,
			error: error.message,
		});
	}
};
