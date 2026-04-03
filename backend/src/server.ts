import 'dotenv/config';
import express, { type Application } from "express";
import type { Response } from 'express'; 
import { prisma } from './lib/db';
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth';
import {closePolls} from "./jobs/polljob"
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes"

import path from "path"

const app: Application = express();
const PORT = process.env.PORT || '3000';

app.use(express.json())

app.use("/api/auth",authRoutes)
app.all("/api/auth/*any", toNodeHandler(auth));
app.use("/api/user",userRoutes);
app.use("/api/admin",adminRoutes);




app.get("/", ( _,res: Response) => {
  res.status(200).json({
    message: "Test success"
  })
});
async function connectToDb() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
}

if(process.env.NODE_ENV === "production"){
    //says both serve the react and backend
    app.use(express.static(path.join(__dirname, "../admin/dist"))); 

    //if it detects route other than API routes, then it is the react
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../admin", "dist", "index.html"));
    })
}

const startServer=(port:String)=>{
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
  connectToDb();
  closePolls();

}

startServer(PORT)