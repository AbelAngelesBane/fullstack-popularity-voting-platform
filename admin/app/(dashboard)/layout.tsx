import NavBar from "@/components/web/NavBar";
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin dashboard",
};

export default function MainLayout({children}:{children:ReactNode}){

    return(
        <>
        <NavBar/>
        <div className="mt-22 mb-8 mx-4 md:ml-52 ">
            {children}
        </div>
        </>
        
    )
}