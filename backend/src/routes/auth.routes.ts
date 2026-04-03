import {Router} from "express";
import {signIn, signUp, verifyOTP, logout, deleteAccount} from "../controllers/auth.controller" 

const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", logout);
router.post("/verifyEmail", verifyOTP);
router.delete("/delete-account", deleteAccount);

export default router