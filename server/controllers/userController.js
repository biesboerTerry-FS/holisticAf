import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ^ register user: /api/user/register
export const registerUser = async (request, response) => {
	try {
		const { name, email, password } = request.body;
		if (!name || !email || !password) {
			return response.json({
				success: false,
				message: "Please provide all required fields",
			});
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return response.json({
				success: false,
				message: "User with this email already exists",
			});
		}
		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await User.create({
			name,
			email,
			password: hashedPassword,
		});

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		response.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return response.json({
			success: true,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
			},
		});
	} catch (error) {
		console.log(error.message);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// ^ login userSelect: /api/user/login
export const loginUser = async (request, response) => {
	try {
		const { email, password } = request.body;
		if (!email || !password) {
			return response.json({
				success: false,
				message: "Email and Password required.",
			});
		}

		const user = await User.findOne({ email });
		if (!user) {
			return response.json({
				success: false,
				message: "Invalid email or password",
			});
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return response.json({
				success: false,
				message: "Invalid email or password",
			});
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "7d",
		});

		response.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return response.json({
			success: true,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
			},
		});
	} catch (error) {
		console.log(error.message);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// ^check user authentication: /api/user/is-auth
export const isAuth = async (request, response) => {
	try {
		const userId = request.user.id;
		const user = await User.findById(userId).select("-password");
		return response.json({
			success: true,
			user,
		});
	} catch (error) {
		console.log(error.message);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// ^ user logout: /api/user/logout
export const logoutUser = async (request, response) => {
	try {
		response.clearCookie("token", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
		});
		return response.json({
			success: true,
			message: "Successfully logged out.",
		});
	} catch (error) {
		console.log(error.message);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// ^ demo login: /api/user/demo-login
export const demoLogin = async (request, response) => {
	try {
		const email = process.env.DEMO_USER_EMAIL;
		const password = process.env.DEMO_USER_PASSWORD;
		const name = process.env.DEMO_USER_NAME || "Demo User";

		if (!email || !password) {
			return response.json({
				success: false,
				message: "Demo account is not configured",
			});
		}

		let user = await User.findOne({ email });
		if (!user) {
			const hashedPassword = await bcrypt.hash(password, 10);
			user = await User.create({
				name,
				email,
				password: hashedPassword,
				clerkId: "demo_user",
				role: "user",
				cartItems: {},
			});
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "7d",
		});

		response.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return response.json({
			success: true,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		console.log(error.message);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

// ^ clerk sync for user
export const syncClerkUser = async (request, response) => {
	try {
		const { clerkId, email, name } = request.body;

		let user = await User.findOne({ $or: [{ email }, { clerkId }] });

		if (user) {
			user.clerkId = clerkId;
			if (!user.name) user.name = name;
			await user.save();
		} else {
			user = await User.create({
				clerkId,
				email,
				name,
				cartItems: {},
			});
		}

		response.json({ success: true, user });
	} catch (error) {
		response.json({ success: false, message: error.message });
	}
};
