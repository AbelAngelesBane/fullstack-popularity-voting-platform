import {Router} from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { registerVote, addComment, getPollComments, searchPoll, getHomeFeed, getVotes } from "../controllers/user.controller";

const router = Router()

router.use(authMiddleware)

router.post("/vote",registerVote);
router.post("/comment", addComment);
router.get("/comments/:id",getPollComments);
router.get("/search", searchPoll);
router.get("/home", getHomeFeed);
router.get("/votes", getVotes) //for feed


export default router