import {Router} from "express";
import {signIn, signUp, verifyOTP, logout, deleteAccount, resendOTP, forgotPassword, resetPassword} from "../controllers/auth.controller" 
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/verifyEmail", verifyOTP);
router.delete("/delete-account", deleteAccount);
router.post("/resend-otp", resendOTP)
router.post("/forgotPassword",forgotPassword)
router.post("/resetPassword", resetPassword)
router.use(authMiddleware)
router.post("/signout",logout);

export default router