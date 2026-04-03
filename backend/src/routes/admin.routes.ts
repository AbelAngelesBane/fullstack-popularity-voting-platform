import {Router} from "express";
import { authMiddleware, adminRoutes } from "../middlewares/auth.middleware";
import {upload} from "../middlewares/upload.middleware"
import { getPollById,registerAdmin,getInvoices, createPolls, getPolls, updatePolls, searchNominees,createCategory,getCategories, registerNominees } from "../controllers/admin.controller";

const router = Router()

router.use(authMiddleware)
router.get("/poll/:pollId", adminRoutes,getPollById)
router.post("/register", registerAdmin)
router.get("/categories", adminRoutes, getCategories)
router.get("/invoices",adminRoutes, getInvoices)
router.get("/polls",adminRoutes ,getPolls)
router.post("/searchNominee",adminRoutes ,searchNominees)
router.post("/poll", [adminRoutes, upload.single("banner")],createPolls)
router.put("/poll/:pollId", adminRoutes,updatePolls)
router.post("/category",adminRoutes, createCategory)
router.post("/nominees",[adminRoutes, upload.single("avatar")],registerNominees)
export default router