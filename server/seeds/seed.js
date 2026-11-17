import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import KrogerProduct from "../models/KrogerProduct.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import Newsletter from "../models/Newsletter.js";
import Contact from "../models/Contact.js";
import Order from "../models/Order.js";
import products from "./data/products.js";

const SEED_PASSWORD = process.env.SEED_PASSWORD || "password123";

const seedProducts = async () => {
	const docs = await Promise.all(
		products.map((product) =>
			KrogerProduct.findOneAndUpdate(
				{ externalId: product.externalId },
				product,
				{ upsert: true, new: true, setDefaultsOnInsert: true },
			),
		),
	);
	console.log(`products: ${docs.length} upserted`);
	return docs;
};

const seedUsers = async () => {
	const hashed = await bcrypt.hash(SEED_PASSWORD, 10);
	const people = [
		{ name: "Bonita Applebaum", email: "bonita@example.com", clerkId: "seed_user_1" },
		{ name: "Marcus Lee", email: "marcus@example.com", clerkId: "seed_user_2" },
		{ name: "Priya Shah", email: "priya@example.com", clerkId: "seed_user_3" },
	];

	const users = [];
	for (const person of people) {
		users.push(
			await User.findOneAndUpdate(
				{ email: person.email },
				{ ...person, password: hashed, role: "user" },
				{ upsert: true, new: true, setDefaultsOnInsert: true },
			),
		);
	}

	// Ensure a demo account exists when demo credentials are configured
	const demoEmail = process.env.DEMO_USER_EMAIL;
	if (demoEmail) {
		const demoPassword = process.env.DEMO_USER_PASSWORD || SEED_PASSWORD;
		const demoHashed = await bcrypt.hash(demoPassword, 10);
		const demoUser = await User.findOneAndUpdate(
			{ email: demoEmail },
			{
				name: process.env.DEMO_USER_NAME || "Demo User",
				email: demoEmail,
				clerkId: "demo_user",
				password: demoHashed,
				role: "user",
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
		users.push(demoUser);
		console.log(`demo user: ${demoUser.email} upserted (password: ${demoPassword})`);
	}

	console.log(`users: ${users.length} upserted (password: ${SEED_PASSWORD})`);
	return users;
};

const seedAdmin = async () => {
	const email = process.env.ADMIN_EMAIL;
	if (!email) {
		console.log("admin: skipped, ADMIN_EMAIL is not set");
		return null;
	}
	const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || SEED_PASSWORD, 10);
	const admin = await User.findOneAndUpdate(
		{ email },
		{
			name: "Admin",
			email,
			clerkId: "seed_admin",
			password: hashed,
			role: "admin",
		},
		{ upsert: true, new: true, setDefaultsOnInsert: true },
	);
	console.log(`admin: ${admin.email} upserted`);
	return admin;
};

const seedAddresses = async (users) => {
	const addresses = [];
	for (const user of users) {
		const address = await Address.findOneAndUpdate(
			{ userId: user._id.toString(), streetLine1: "100 Main St" },
			{
				userId: user._id.toString(),
				firstName: user.name.split(" ")[0],
				lastName: user.name.split(" ").slice(1).join(" ") || "Doe",
				streetLine1: "100 Main St",
				streetLine2: "",
				city: "Portland",
				state: "OR",
				zipCode: "97203",
				phone: "5555555555",
				email: user.email,
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
		await User.updateOne(
			{ _id: user._id },
			{ $addToSet: { addresses: address._id } },
		);
		addresses.push(address);
	}
	console.log(`addresses: ${addresses.length} upserted`);
	return addresses;
};

const seedNewsletter = async () => {
	const emails = ["news1@example.com", "news2@example.com", "news3@example.com"];
	for (const email of emails) {
		await Newsletter.updateOne({ email }, { email }, { upsert: true });
	}
	console.log(`newsletter: ${emails.length} ensured`);
};

const seedContacts = async () => {
	const messages = [
		{ name: "Jordan Kim", email: "jordan@example.com", subject: "Delivery question", message: "Do you deliver to Vancouver, WA?", status: "new" },
		{ name: "Alex Rivera", email: "alex@example.com", subject: "Bulk order", message: "Can I order 50 units of the quinoa for an event?", status: "read" },
	];
	for (const msg of messages) {
		await Contact.updateOne({ email: msg.email, subject: msg.subject }, msg, { upsert: true });
	}
	console.log(`contacts: ${messages.length} ensured`);
};

const seedDemoOrder = async (users) => {
	const demoUser = users.find((u) => u.email === process.env.DEMO_USER_EMAIL);
	if (!demoUser) {
		console.log("demo order: skipped, demo user not found");
		return null;
	}
	const address = await Address.findOne({ userId: demoUser._id.toString() });
	if (!address) {
		console.log("demo order: skipped, demo user has no address");
		return null;
	}
	const sampleProduct = products[0] || { name: "Organic Quinoa", externalId: "quinoa-001" };
	const order = await Order.findOneAndUpdate(
		{ userId: demoUser._id.toString(), paymentType: "COD" },
		{
			userId: demoUser._id.toString(),
			items: [
				{
					product: sampleProduct.externalId || sampleProduct._id || "demo-product",
					productSource: "local",
					quantity: 2,
					price: 12.99,
					name: sampleProduct.name || "Demo Product",
				},
			],
			amount: 25.98,
			address: address._id,
			paymentType: "COD",
			isPaid: false,
			status: "processing",
		},
		{ upsert: true, new: true, setDefaultsOnInsert: true },
	);
	console.log(`demo order: ${order._id} upserted`);
	return order;
};

const run = async () => {
	if (!process.env.MONGODB_URI) {
		throw new Error("MONGODB_URI is not set in server/.env");
	}
	await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
	console.log(`connected to ${mongoose.connection.name}`);

	await seedProducts();
	const users = await seedUsers();
	const admin = await seedAdmin();
	if (admin) users.push(admin);
	await seedAddresses(users);
	await seedDemoOrder(users);
	await seedNewsletter();
	await seedContacts();

	console.log("seed complete");
};

run()
	.catch((error) => {
		console.error("seed failed:", error.message);
		process.exitCode = 1;
	})
	.finally(() => mongoose.disconnect());
