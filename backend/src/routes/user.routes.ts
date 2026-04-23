import {Router} from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { registerVote, addComment, getPollComments, searchPoll, getHomeFeed, getVotes, getCurrentUser, updateUser } from "../controllers/user.controller";
import { getPollById, updatePolls, deleteComment } from "../controllers/admin.controller";
const router = Router()

router.use(authMiddleware)

router.post("/vote",registerVote);
router.post("/comment", addComment);
router.get("/comments/:id",getPollComments);
router.get("/search", searchPoll);
router.get("/home", getHomeFeed);
router.get("/votes", getVotes); //for feed
router.get("/myprofile", getCurrentUser);
router.post("/profile", updateUser);
router.post("/poll/:pollId", updatePolls);
router.get("/poll/:pollId", getPollById);
router.get("/comment",deleteComment);


export default router