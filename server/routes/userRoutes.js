import express from "express";
import {
	registerUser,
	loginUser,
	isAuth,
	logoutUser,
	syncClerkUser,
	demoLogin,
} from "../controllers/userController.js";
import authUser from "../middleware/authUser.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/demo-login", demoLogin);
userRouter.post("/sync", syncClerkUser);
userRouter.get("/is-auth", authUser, isAuth);
userRouter.get("/logout", authUser, logoutUser);

export default userRouter;
