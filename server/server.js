import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./configs/db.js";
import "dotenv/config";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import productRouter from "./routes/productRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import addressRouter from "./routes/addressRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import krogerRouter from "./routes/krogerRoutes.js";
import newsletterRouter from "./routes/newsletterRoute.js";
import contactRouter from "./routes/contactRoutes.js";
import employeeRouter from "./routes/employeeRoutes.js";
import fetch from "node-fetch";

const app = express();

const port = process.env.PORT || 4000;

await connectDb();
await connectCloudinary();

const allowedOrigins = [
	"http://localhost:5173",
	"http://localhost:5176",
	"http://localhost:5177",
	"http://localhost:5180",
	"http://localhost:8083",
	"http://127.0.0.1:5173",
	"http://127.0.0.1:5176",
	"http://127.0.0.1:5177",
	"http://127.0.0.1:5180",
	"http://127.0.0.1:8083",
];

app.use(express.json());
app.use(cookieParser());
app.use((request, response, next) => {
	const origin = request.headers.origin;
	if (origin && allowedOrigins.includes(origin)) {
		response.setHeader("Access-Control-Allow-Origin", origin);
		response.setHeader("Access-Control-Allow-Credentials", "true");
		response.setHeader("Vary", "Origin");
	}
	if (request.method === "OPTIONS") {
		response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
		response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, clerkid");
		return response.status(204).end();
	}
	next();
});

app.get("/", (request, response) => response.send("API connected"));
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/inventory", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/kroger", krogerRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/contact", contactRouter);
app.use("/api/employees", employeeRouter);

app.get("/api/media/image", async (req, res) => {
	try {
		const { upc } = req.query;

		if (!upc) {
			return res.status(400).send("Missing UPC");
		}

		const imageUrl = `https://www.kroger.com/product/images/large/front/${upc}`;

		const response = await fetch(imageUrl);

		if (!response.ok) {
			return res.redirect("/fallback.png");
		}

		res.setHeader("Content-Type", response.headers.get("content-type"));
		response.body.pipe(res);
	} catch (err) {
		console.error("Image proxy error:", err.message);
		res.redirect("/fallback.png");
	}
});

app.use((error, request, response, next) => {
	console.error("Server error:", error);
	response.status(500).json({
		success: false,
		message: error.message,
	});
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
