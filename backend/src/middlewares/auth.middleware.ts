import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js"; 
import type { Request, Response, NextFunction } from "express";
import type { error } from "node:console";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
    console.log("Headers check:", req.headers.authorization);
    console.log("session: ", session)
    console.log("RAW COOKIES RECEIVED:", req.headers.cookie);
    if (!session) {
        return res.status(401).json({ 
            error: "Unauthorized. Please sign in to continue." 
        });
    }
    
    req.user = session.user;
    req.session = session.session;

    next();
};

export const adminRoutes= async (req: Request, res: Response, next: NextFunction)=>{
        const user = req.user;
        console.log("Is there an admion: ", user)
        if(!user || (user.role !== "super_admin" && user.role !== "admin"))return res.status(403).json({error:"Forbidden"})
        next()
}